import os
import logging
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from datetime import datetime
import json

logger = logging.getLogger(__name__)

class PDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            textColor=colors.darkblue
        )
        self.heading_style = ParagraphStyle(
            'CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceAfter=12,
            textColor=colors.darkblue
        )
    
    def generate_plan_pdf(self, plan_data):
        """Generate PDF for action plan."""
        try:
            # Create exports directory if it doesn't exist
            os.makedirs('exports', exist_ok=True)
            
            filename = f"action_plan_{plan_data.get('plan_id', 'unknown')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            filepath = os.path.join('exports', filename)
            
            doc = SimpleDocTemplate(filepath, pagesize=A4)
            story = []
            
            # Get AI response data
            ai_response = plan_data.get('ai_response', {})
            action_plan = ai_response.get('action_plan', {})
            
            # Title
            title_text = action_plan.get('title', 'Action Plan')
            title = Paragraph(title_text, self.title_style)
            story.append(title)
            story.append(Spacer(1, 20))
            
            # User Request
            story.append(Paragraph("Request", self.heading_style))
            user_request = plan_data.get('user_request', 'No request specified')
            story.append(Paragraph(user_request, self.styles['Normal']))
            story.append(Spacer(1, 12))
            
            # Overview
            if action_plan.get('overview'):
                story.append(Paragraph("Overview", self.heading_style))
                story.append(Paragraph(action_plan['overview'], self.styles['Normal']))
                story.append(Spacer(1, 12))
            
            # Action Cards
            cards = action_plan.get('cards', [])
            if cards:
                story.append(Paragraph("Action Items", self.heading_style))
                for i, card in enumerate(cards, 1):
                    if isinstance(card, dict):
                        # Card title and description
                        card_title = f"{i}. {card.get('title', 'Action Item')}"
                        story.append(Paragraph(card_title, self.styles['Heading3']))
                        
                        if card.get('description'):
                            story.append(Paragraph(card['description'], self.styles['Normal']))
                        
                        # Card details table
                        card_details = []
                        if card.get('category'):
                            card_details.append(['Category:', card['category'].title()])
                        if card.get('priority'):
                            card_details.append(['Priority:', card['priority'].title()])
                        if card.get('timeline'):
                            card_details.append(['Timeline:', card['timeline']])
                        if card.get('budget_estimate'):
                            card_details.append(['Budget:', card['budget_estimate']])
                        
                        if card_details:
                            details_table = Table(card_details, colWidths=[1.5*inch, 4*inch])
                            details_table.setStyle(TableStyle([
                                ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
                                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                                ('FONTSIZE', (0, 0), (-1, -1), 9),
                                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                                ('GRID', (0, 0), (-1, -1), 1, colors.black)
                            ]))
                            story.append(details_table)
                        
                        # Tasks
                        tasks = card.get('tasks', [])
                        if tasks:
                            story.append(Paragraph("Tasks:", self.styles['Heading4']))
                            for task in tasks:
                                if isinstance(task, dict):
                                    task_text = f"• {task.get('task', 'Task')}"
                                    if task.get('assignee'):
                                        task_text += f" (Assigned to: {task['assignee']})"
                                    story.append(Paragraph(task_text, self.styles['Normal']))
                        
                        story.append(Spacer(1, 15))
                
                story.append(Spacer(1, 12))
            
            # Timeline Summary
            timeline = action_plan.get('timeline', {})
            if timeline:
                story.append(Paragraph("Timeline Summary", self.heading_style))
                if timeline.get('total_duration'):
                    story.append(Paragraph(f"Total Duration: {timeline['total_duration']}", self.styles['Normal']))
                
                phases = timeline.get('phases', [])
                if phases:
                    for phase in phases:
                        if isinstance(phase, dict):
                            phase_text = f"<b>{phase.get('phase', 'Phase')}</b> - {phase.get('duration', 'Duration TBD')}"
                            story.append(Paragraph(phase_text, self.styles['Normal']))
                            activities = phase.get('key_activities', [])
                            for activity in activities:
                                story.append(Paragraph(f"• {activity}", self.styles['Normal']))
                story.append(Spacer(1, 12))
            
            # Budget Summary
            budget_summary = action_plan.get('budget_summary', {})
            if budget_summary:
                story.append(Paragraph("Budget Summary", self.heading_style))
                if budget_summary.get('total_estimate'):
                    story.append(Paragraph(f"Total Estimate: {budget_summary['total_estimate']}", self.styles['Normal']))
                
                breakdown = budget_summary.get('breakdown', [])
                if breakdown:
                    budget_data = [['Category', 'Amount', 'Percentage']]
                    for item in breakdown:
                        if isinstance(item, dict):
                            budget_data.append([
                                item.get('category', ''),
                                item.get('amount', ''),
                                f"{item.get('percentage', 0)}%"
                            ])
                    
                    budget_table = Table(budget_data, colWidths=[2*inch, 2*inch, 1.5*inch])
                    budget_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('FONTSIZE', (0, 0), (-1, -1), 10),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                        ('GRID', (0, 0), (-1, -1), 1, colors.black)
                    ]))
                    
                    story.append(budget_table)
                story.append(Spacer(1, 12))
            
            # Footer
            story.append(Spacer(1, 30))
            footer_text = f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}"
            story.append(Paragraph(footer_text, self.styles['Normal']))
            
            # Build PDF
            doc.build(story)
            
            logger.info(f"PDF generated successfully: {filepath}")
            return filepath
            
        except Exception as e:
            logger.error(f"Failed to generate PDF: {e}")
            raise e
