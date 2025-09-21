from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_groq import ChatGroq
import uuid
import json
import os
import logging
from typing import Dict, List
from dotenv import load_dotenv
from datetime import datetime
import requests
from services.pdf_generator import PDFGenerator
from services.excel_generator import ExcelGenerator

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize services
conversation_history: Dict[str, List] = {}
pdf_generator = PDFGenerator()
excel_generator = ExcelGenerator()
stored_plans: Dict[str, Dict] = {}  # In-memory storage for generated plans

# Initialize LLM
llm = ChatGroq(model="llama-3.3-70b-versatile", api_key=os.environ.get("GROQ_API_KEY"))

def load_prompt() -> str:
    """Load the system prompt from file."""
    current_path = os.path.dirname(os.path.abspath(__file__))
    prompt_path = os.path.join(current_path, "event_planner_prompt.txt")
    try:
        with open(prompt_path, "r", encoding="utf-8") as file:
            return file.read()
    except Exception as e:
        logger.error(f"Error loading prompt file: {str(e)}")
        return "You are EventPlanner Pro, an AI assistant for event management and productivity."

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "AI Backend",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/ai/generate-action-plan', methods=['POST'])
def generate_action_plan():
    """Generate comprehensive action plan based on user request and channel context."""
    try:
        data = request.get_json()
        user_request = data.get('request', '')
        event_type = data.get('eventType', 'general')
        channel_id = data.get('channelId')
        user_id = data.get('userId')
        ai_context = data.get('aiContext', {})
        
        if not user_request:
            return jsonify({"error": "Request is required"}), 400
        
        # Build context from channel AI context
        context_info = ""
        if ai_context:
            context_info = f"""
            
        Channel Context:
        - Objective: {ai_context.get('objective', 'Not specified')}
        - Target Audience: {ai_context.get('targetAudience', 'Not specified')}
        - Budget: {ai_context.get('budget', 'Not specified')}
        - Timeline: {ai_context.get('timeline', 'Not specified')}
        - Key Challenges: {ai_context.get('challenges', 'Not specified')}
        """
        
        # Prepare detailed prompt for action planning
        prompt = f"""
        Generate a comprehensive action plan for the following request:
        
        Request: {user_request}
        Event Type: {event_type}{context_info}
        
        Please provide a detailed action plan in JSON format with the following structure:
        {{
            "title": "Action Plan Title",
            "overview": "Brief overview of the plan",
            "cards": [
                {{
                    "id": "unique_id",
                    "title": "Action Item Title",
                    "description": "Detailed description",
                    "category": "planning|execution|logistics|marketing|finance",
                    "priority": "high|medium|low",
                    "timeline": "estimated time",
                    "budget_estimate": "cost estimate",
                    "tasks": [
                        {{
                            "task": "specific task",
                            "assignee": "role or person"
                        }}
                    ],
                    "resources": ["resource1", "resource2"],
                    "dependencies": ["dependency1", "dependency2"]
                }}
            ],
            "timeline": {{
                "total_duration": "overall timeline",
                "phases": [
                    {{
                        "phase": "phase name",
                        "duration": "time needed",
                        "key_activities": ["activity1", "activity2"]
                    }}
                ]
            }},
            "budget_summary": {{
                "total_estimate": "total cost",
                "breakdown": [
                    {{
                        "category": "category name",
                        "amount": "cost",
                        "percentage": 25
                    }}
                ]
            }},
            "team_roles": [
                {{
                    "role": "role name",
                    "responsibilities": ["resp1", "resp2"],
                    "skills_required": ["skill1", "skill2"]
                }}
            ],
            "success_metrics": ["metric1", "metric2"],
            "risk_factors": [
                {{
                    "risk": "risk description",
                    "impact": "high|medium|low",
                    "mitigation": "mitigation strategy"
                }}
            ]
        }}
        
        Make sure the response is valid JSON and comprehensive. Use the channel context to make the plan more specific and relevant.
        Make sure to provide at least 5-8 actionable cards with specific, practical steps.
        Use Indian Rupee (₹) for all monetary values and Indian number formatting.
        """
        
        # Generate AI response
        result = llm.invoke([
            SystemMessage(content=load_prompt()),
            HumanMessage(content=prompt)
        ])
        
        ai_response = result.content
        
        try:
            # Parse the JSON response
            parsed_plan = json.loads(ai_response)
            
            # Generate unique plan ID
            plan_id = str(uuid.uuid4())
            
            # Store plan in memory for later export
            plan_data = {
                "plan_id": plan_id,
                "user_id": user_id,
                "channel_id": channel_id,
                "user_request": user_request,
                "event_type": event_type,
                "ai_response": parsed_plan,
                "created_at": datetime.now().isoformat(),
                "status": "generated"
            }
            
            stored_plans[plan_id] = plan_data
            
            # Send plan data to Node.js server for database storage
            try:
                node_server_url = os.getenv('NODE_SERVER_URL', 'http://localhost:5000')
                requests.post(f"{node_server_url}/api/ai/store-plan", json=plan_data, timeout=5)
            except Exception as e:
                logger.warning(f"Failed to notify Node.js server: {e}")
            
            return jsonify({
                "success": True,
                "plan_id": plan_id,
                "action_plan": parsed_plan.get("action_plan", {}),
                "message": "Action plan generated successfully"
            })
            
        except json.JSONDecodeError:
            logger.error("Failed to parse AI response as JSON")
            return jsonify({
                "success": False,
                "error": "Failed to generate structured action plan",
                "raw_response": ai_response[:500]  # First 500 chars for debugging
            }), 500
            
    except Exception as e:
        logger.error(f"Generate action plan error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    """Dynamic AI chat for event planning assistance."""
    try:
        data = request.get_json()
        message = data.get('message')
        user_id = data.get('userId')
        channel_id = data.get('channelId')
        ai_context = data.get('aiContext', {})
        event_type = data.get('eventType', 'general')
        
        if not message:
            return jsonify({"error": "Message is required"}), 400
        
        # Build context-aware system prompt
        context_prompt = f"""You are an expert AI assistant specializing in {event_type} event planning and management. 
        
        Channel Context:
        - Event Type: {event_type}
        - Objective: {ai_context.get('objective', 'Not specified')}
        - Target Audience: {ai_context.get('targetAudience', 'Not specified')}
        - Budget: {ai_context.get('budget', 'Not specified')}
        - Timeline: {ai_context.get('timeline', 'Not specified')}
        - Key Challenges: {ai_context.get('challenges', 'Not specified')}
        
        Your role:
        1. Provide specific, actionable advice for this {event_type}
        2. Ask relevant follow-up questions to gather more details
        3. Suggest task breakdowns and team assignments
        4. Offer budget and timeline recommendations
        5. Help solve specific challenges mentioned
        6. Be conversational and helpful
        
        Always provide practical, implementable suggestions. Use Indian context and currency (₹) when discussing costs."""
        
        # Generate AI response
        result = llm.invoke([
            SystemMessage(content=context_prompt),
            HumanMessage(content=message)
        ])
        
        ai_response = result.content
        
        return jsonify({
            "success": True,
            "response": ai_response,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"AI chat error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/ai/suggest-roles', methods=['POST'])
def suggest_roles():
    """Suggest roles based on event type and team size."""
    try:
        data = request.get_json()
        event_type = data.get('eventType', 'general')
        team_size = data.get('teamSize', 5)
        event_scale = data.get('eventScale', 'medium')
        
        prompt = f"""
        Suggest optimal team roles for a {event_type} event with {team_size} team members.
        Event scale: {event_scale}
        
        Provide role suggestions with:
        1. Role title and priority level
        2. Key responsibilities
        3. Required skills
        4. Recommended experience level
        5. Time commitment
        
        Consider the team size and suggest the most essential roles first.
        """
        
        result = llm.invoke([
            SystemMessage(content=load_prompt()),
            HumanMessage(content=prompt)
        ])
        
        try:
            role_suggestions = json.loads(result.content)
            return jsonify({
                "success": True,
                "roles": role_suggestions
            })
        except json.JSONDecodeError:
            return jsonify({
                "success": False,
                "error": "Failed to parse role suggestions"
            }), 500
            
    except Exception as e:
        logger.error(f"Suggest roles error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/ai/export-plan/<format>', methods=['POST'])
def export_plan(format):
    """Export action plan as PDF or Excel."""
    try:
        data = request.get_json()
        plan_id = data.get('planId')
        
        if not plan_id:
            return jsonify({"error": "Plan ID is required"}), 400
        
        # Get plan from in-memory storage
        plan_data = stored_plans.get(plan_id)
        if not plan_data:
            return jsonify({"error": "Plan not found"}), 404
        
        if format.lower() == 'pdf':
            file_path = pdf_generator.generate_plan_pdf(plan_data)
        elif format.lower() == 'excel':
            file_path = excel_generator.generate_plan_excel(plan_data)
        else:
            return jsonify({"error": "Invalid format. Use 'pdf' or 'excel'"}), 400
        
        return jsonify({
            "success": True,
            "downloadUrl": f"/api/ai/download/{os.path.basename(file_path)}",
            "fileName": os.path.basename(file_path)
        })
        
    except Exception as e:
        logger.error(f"Export plan error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/ai/download/<filename>')
def download_file(filename):
    """Download generated files."""
    try:
        from flask import send_file
        file_path = os.path.join('exports', filename)
        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=True)
        else:
            return jsonify({"error": "File not found"}), 404
    except Exception as e:
        logger.error(f"Download error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/ai/get-plan/<plan_id>', methods=['GET'])
def get_plan(plan_id):
    """Get stored action plan by ID."""
    try:
        plan_data = stored_plans.get(plan_id)
        if not plan_data:
            return jsonify({"error": "Plan not found"}), 404
        
        return jsonify({
            "success": True,
            "plan": plan_data
        })
        
    except Exception as e:
        logger.error(f"Get plan error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    # Create exports directory if it doesn't exist
    os.makedirs('exports', exist_ok=True)
    
    port = int(os.getenv('FLASK_PORT', 5001))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    app.run(debug=debug, host="0.0.0.0", port=port)
