from flask import Flask, request, jsonify
from flask_cors import CORS
from phi_model import phi_model
from datetime import datetime
import json

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# In-memory storage for chat histories (per user)
chat_histories = {}
MAX_HISTORY_LENGTH = 10

def get_user_history(user_id):
    """Get chat history for a user"""
    if user_id not in chat_histories:
        chat_histories[user_id] = []
    return chat_histories[user_id]

def add_to_history(user_id, role, content):
    """Add message to user's chat history"""
    history = get_user_history(user_id)
    history.append({"role": role, "content": content, "timestamp": datetime.now().isoformat()})
    if len(history) > MAX_HISTORY_LENGTH:
        history.pop(0)

@app.route('/api/phi/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'Phi AI Service is running',
        'model': 'Phi-3.5-mini (4-bit quantized)',
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/api/phi/chat', methods=['POST'])
def chat():
    """Chat endpoint for Phi model"""
    try:
        data = request.json
        user_id = data.get('userId', 'unknown')
        user_type = data.get('userType', 'student')  # student, teacher, admin
        user_message = data.get('message', '').strip()
        user_info = data.get('userInfo', {})
        
        if not user_message:
            return jsonify({'error': 'Message cannot be empty'}), 400
        
        # Add user message to history
        add_to_history(user_id, 'user', user_message)
        history = get_user_history(user_id)
        
        # Build context-aware prompt
        system_prompt = f"""You are a helpful University Management AI Assistant.
        
User Type: {user_type.upper()}
User: {user_info.get('fullName', 'User')}

Be concise and helpful (2-3 sentences max)."""
        
        # Build full prompt with context
        if len(history) > 1:
            context = "\n".join([f"{m['role'].capitalize()}: {m['content']}" for m in history[:-1]])
            prompt = f"{system_prompt}\n\nContext:\n{context}\n\nUser: {user_message}\nAssistant:"
        else:
            prompt = f"{system_prompt}\n\nUser: {user_message}\nAssistant:"
        
        # Generate response
        ai_response = phi_model.generate_response(prompt, max_tokens=250)
        
        # Add AI response to history
        add_to_history(user_id, 'assistant', ai_response)
        
        return jsonify({
            'success': True,
            'message': user_message,
            'response': ai_response,
            'userType': user_type,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/phi/history/<user_id>', methods=['GET'])
def get_history(user_id):
    """Get chat history for a user"""
    try:
        history = get_user_history(user_id)
        return jsonify({
            'success': True,
            'userId': user_id,
            'history': history,
            'count': len(history)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/phi/clear/<user_id>', methods=['DELETE'])
def clear_history(user_id):
    """Clear chat history for a user"""
    try:
        if user_id in chat_histories:
            chat_histories[user_id] = []
        return jsonify({
            'success': True,
            'message': f'Chat history cleared for user {user_id}'
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("🚀 Phi AI Service Starting...")
    print("=" * 60)
    print("✅ Flask API running on http://localhost:5000")
    print("📍 Endpoints:")
    print("   - POST /api/phi/chat (Send message)")
    print("   - GET  /api/phi/health (Check status)")
    print("   - GET  /api/phi/history/<user_id> (Get chat history)")
    print("   - DELETE /api/phi/clear/<user_id> (Clear history)")
    print("=" * 60 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=False)
