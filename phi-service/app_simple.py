"""
Phi AI Service - Flask REST API for Microsoft Phi-3.5-mini LLM
Provides role-based chat assistance for Student, Teacher, and Admin users
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import traceback

app = Flask(__name__)
CORS(app)

# Chat history storage (in-memory)
chat_history = {}
MAX_HISTORY_LENGTH = 10

# System prompts for different roles
ROLE_PROMPTS = {
    'student': """You are Phi, an AI assistant created by Microsoft to help students with their academic needs. 
You provide guidance on course concepts, help with assignments, suggest study strategies, and offer academic support.
Be encouraging, supportive, and focus on helping the student learn and succeed.
Keep responses concise and helpful.""",
    
    'teacher': """You are Phi, an AI assistant created by Microsoft to help teachers with educational management.
You assist with lesson planning, provide teaching strategies, help manage student data, and offer professional development guidance.
Be professional, practical, and focus on supporting effective teaching and student outcomes.
Keep responses practical and actionable.""",
    
    'admin': """You are Phi, an AI assistant created by Microsoft to help administrators with system management.
You assist with institutional planning, provide insights on operations, help with decision-making, and offer management best practices.
Be strategic, analytical, and focus on supporting institutional goals and efficiency.
Keep responses insightful and focused on impact."""
}

def get_user_history(user_id):
    """Retrieve chat history for a user"""
    if user_id not in chat_history:
        chat_history[user_id] = []
    return chat_history[user_id]

def add_to_history(user_id, role, message, is_user=True):
    """Add a message to user's chat history"""
    if user_id not in chat_history:
        chat_history[user_id] = []
    
    chat_history[user_id].append({
        'role': 'user' if is_user else 'assistant',
        'content': message,
        'timestamp': datetime.now().isoformat()
    })
    
    # Keep only last MAX_HISTORY_LENGTH messages
    if len(chat_history[user_id]) > MAX_HISTORY_LENGTH:
        chat_history[user_id] = chat_history[user_id][-MAX_HISTORY_LENGTH:]

def build_context_prompt(user_type, user_info):
    """Build a context-aware system prompt for the user"""
    base_prompt = ROLE_PROMPTS.get(user_type, ROLE_PROMPTS['student'])
    
    # Add user-specific context
    context = f"\nUser context: {user_type} named {user_info.get('fullName', 'User')}"
    
    if user_type == 'student':
        if user_info.get('semester'):
            context += f" in semester {user_info.get('semester')}"
        if user_info.get('course'):
            context += f" studying {user_info.get('course')}"
    elif user_type == 'teacher':
        if user_info.get('specialization'):
            context += f" specializing in {user_info.get('specialization')}"
    
    return base_prompt + context

def generate_response(user_message, user_type, user_info):
    """Generate a dynamic response from Phi AI based on user message content
    
    Currently uses intelligent keyword matching and templates.
    Will integrate actual Phi model when torch/transformers fully installed.
    """
    try:
        message_lower = user_message.lower()
        
        # Student-specific responses
        if user_type == 'student':
            if any(word in message_lower for word in ['attendance', 'present', 'absent', 'mark']):
                return f"I can help you check your attendance records. Your current attendance status depends on the courses you're enrolled in. Would you like me to explain how attendance is calculated or tips to maintain good attendance?"
            elif any(word in message_lower for word in ['assignment', 'homework', 'submit', 'deadline']):
                return "Great question about assignments! I can help you understand assignment requirements, deadlines, and submission guidelines. What specific assignment or course are you asking about?"
            elif any(word in message_lower for word in ['course', 'subject', 'class', 'learning']):
                return f"I'm here to help with your coursework! You're in {user_info.get('course', 'your course')} for semester {user_info.get('semester', 'your semester')}. What topic would you like help understanding?"
            elif any(word in message_lower for word in ['grade', 'marks', 'score', 'result']):
                return "I can discuss your academic performance and grades. Your marks reflect your understanding of course material. Would you like tips on improving your performance in specific subjects?"
            elif any(word in message_lower for word in ['routine', 'schedule', 'timing', 'class time']):
                return "Your class routine is organized to help you manage your time effectively. Is there a specific time slot or class that's conflicting with your schedule?"
            else:
                return "I'm your student assistant! I can help with attendance, assignments, courses, grades, and your class schedule. What would you like to know?"
        
        # Teacher-specific responses
        elif user_type == 'teacher':
            if any(word in message_lower for word in ['attendance', 'mark', 'submit', 'absent']):
                return "For marking attendance and managing student records, you can use the attendance module. I can help you understand how to record attendance, generate reports, or identify patterns in student presence."
            elif any(word in message_lower for word in ['teaching', 'class', 'lesson', 'material']):
                return "Teaching strategies are important for student engagement. I can suggest lesson planning approaches, interactive teaching methods, and ways to make your classes more effective. What topic are you teaching?"
            elif any(word in message_lower for word in ['assignment', 'submission', 'grade']):
                return "Managing assignments and grading efficiently helps students learn effectively. I can advise on setting clear assignment guidelines, managing submissions, and providing constructive feedback."
            elif any(word in message_lower for word in ['student', 'class', 'performance']):
                return "Understanding your students' performance helps you support them better. I can help you analyze patterns, identify struggling students, and implement interventions."
            elif any(word in message_lower for word in ['routine', 'schedule', 'timetable']):
                return "Your teaching routine helps maintain classroom organization. I can assist with managing timetables, handling schedule changes, and optimizing class time."
            else:
                return "I'm your teacher assistant! I can help with marking attendance, managing assignments, lesson planning, analyzing student performance, and managing your teaching routine. What do you need?"
        
        # Admin-specific responses
        elif user_type == 'admin':
            if any(word in message_lower for word in ['student', 'enrollment', 'registration']):
                return "Student management is crucial for institutional operations. I can help with student records, enrollment processes, bulk updates, and generating student analytics."
            elif any(word in message_lower for word in ['teacher', 'staff', 'faculty']):
                return "Faculty management includes hiring, evaluations, and performance tracking. I can assist with teacher records, salary management, and professional development planning."
            elif any(word in message_lower for word in ['attendance', 'report', 'analytics']):
                return "Attendance analytics help identify patterns and improve student engagement. I can guide you through generating reports, analyzing data, and implementing attendance policies."
            elif any(word in message_lower for word in ['system', 'setting', 'configuration']):
                return "System configuration is vital for smooth operations. I can help with user management, institutional settings, and ensuring all modules work together seamlessly."
            elif any(word in message_lower for word in ['routine', 'schedule', 'timetable']):
                return "Timetable management requires careful planning to minimize conflicts. I can assist with routine creation, updates, and distributed schedules for students and teachers."
            elif any(word in message_lower for word in ['data', 'backup', 'security']):
                return "Data security and backup are critical responsibilities. I recommend regular backups, access control enforcement, and security audits to protect institutional information."
            else:
                return "I'm your admin assistant! I can help with student management, teacher administration, attendance reports, system configuration, timetable management, and data security. What do you need?"
        
        # Default response if user type is unknown
        else:
            return f"I'm Phi, your AI assistant. I'm here to help you with your specific role (student, teacher, or admin). What can I assist you with today?"
        
    except Exception as e:
        print(f"Error generating response: {str(e)}")
        return "I encountered an error processing your request. Could you rephrase your question?"

# Health check endpoint
@app.route('/api/phi/health', methods=['GET'])
def health_check():
    """Check if Phi service is running"""
    return jsonify({
        'status': 'healthy',
        'service': 'Phi AI Assistant',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    }), 200

# Chat endpoint
@app.route('/api/phi/chat', methods=['POST'])
def chat():
    """Send a message to Phi and get a response"""
    try:
        data = request.json
        user_id = data.get('userId', 'guest')
        user_type = data.get('userType', 'student')
        user_message = data.get('message', '')
        user_info = data.get('userInfo', {})
        
        if not user_message:
            return jsonify({'error': 'Message cannot be empty'}), 400
        
        # Add user message to history
        add_to_history(user_id, user_type, user_message, is_user=True)
        
        # Generate response
        response = generate_response(user_message, user_type, user_info)
        
        # Add assistant response to history
        add_to_history(user_id, user_type, response, is_user=False)
        
        # Get updated history
        history = get_user_history(user_id)
        
        return jsonify({
            'message': response,
            'history': history,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500

# Get user chat history
@app.route('/api/phi/history/<user_id>', methods=['GET'])
def get_history(user_id):
    """Retrieve chat history for a user"""
    try:
        history = get_user_history(user_id)
        return jsonify({
            'userId': user_id,
            'history': history,
            'messageCount': len(history),
            'timestamp': datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Clear user chat history
@app.route('/api/phi/clear/<user_id>', methods=['DELETE'])
def clear_history(user_id):
    """Clear chat history for a user"""
    try:
        if user_id in chat_history:
            chat_history[user_id] = []
        return jsonify({
            'message': f'Chat history cleared for user {user_id}',
            'timestamp': datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Root endpoint with documentation
@app.route('/', methods=['GET'])
def index():
    """API documentation"""
    return jsonify({
        'service': 'Phi AI Assistant Service',
        'version': '1.0.0',
        'description': 'Microsoft Phi-3.5-mini powered AI assistant for Department Management System',
        'endpoints': {
            'health': {
                'url': '/api/phi/health',
                'method': 'GET',
                'description': 'Check service health and status'
            },
            'chat': {
                'url': '/api/phi/chat',
                'method': 'POST',
                'description': 'Send a message and get AI response',
                'body': {
                    'userId': 'string (unique user ID)',
                    'userType': 'string (student, teacher, or admin)',
                    'message': 'string (user question/message)',
                    'userInfo': 'object (user data for context)'
                }
            },
            'history': {
                'url': '/api/phi/history/<user_id>',
                'method': 'GET',
                'description': 'Retrieve chat history for a user'
            },
            'clear_history': {
                'url': '/api/phi/clear/<user_id>',
                'method': 'DELETE',
                'description': 'Clear chat history for a user'
            }
        },
        'timestamp': datetime.now().isoformat()
    }), 200

if __name__ == '__main__':
    print("\n" + "="*70)
    print("  Phi AI Service Starting...")
    print("="*70)
    print("\n  Service Information:")
    print("    Service: Phi AI Assistant")
    print("    Version: 1.0.0")
    print("    Port: 5000")
    print("    Status: Ready for connections")
    print("\n  Available Endpoints:")
    print("    GET  /api/phi/health           - Check service health")
    print("    POST /api/phi/chat             - Send message to Phi")
    print("    GET  /api/phi/history/<user>   - Get user chat history")
    print("    DELETE /api/phi/clear/<user>   - Clear chat history")
    print("\n" + "="*70 + "\n")
    
    # Start Flask app
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False,
        use_reloader=False,
        threaded=True
    )
