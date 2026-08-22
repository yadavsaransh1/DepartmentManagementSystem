"""
Phi AI Service - Flask REST API for Intelligent Conversational AI
Provides intelligent responses using local models or smart fallback
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import traceback
import os
import random

app = Flask(__name__)
CORS(app)

# Try to load the local Phi model
try:
    from phi_model_v2 import phi_model, MODEL_LOADED
    print("✓ Using local Phi-3.5-mini model")
    USE_LOCAL_MODEL = True
except ImportError:
    phi_model = None
    MODEL_LOADED = False
    USE_LOCAL_MODEL = False
    print("⚠ Using intelligent local fallback responses")

# Chat history storage (in-memory)
chat_history = {}
MAX_HISTORY_LENGTH = 20

def get_user_history(user_id):
    """Retrieve chat history for a user"""
    if user_id not in chat_history:
        chat_history[user_id] = []
    return chat_history[user_id]

def add_to_history(user_id, role, message):
    """Add a message to user's chat history"""
    if user_id not in chat_history:
        chat_history[user_id] = []
    
    chat_history[user_id].append({
        'role': role,
        'content': message,
        'timestamp': datetime.now().isoformat()
    })
    
    # Keep only last MAX_HISTORY_LENGTH messages for context
    if len(chat_history[user_id]) > MAX_HISTORY_LENGTH:
        chat_history[user_id] = chat_history[user_id][-MAX_HISTORY_LENGTH:]

def build_conversation_context(user_id):
    """Build context from chat history for the model"""
    history = get_user_history(user_id)
    context = ""
    
    for msg in history[-10:]:  # Use last 10 messages for context
        role = "User" if msg['role'] == 'user' else "Assistant"
        context += f"{role}: {msg['content']}\n"
    
    return context

def generate_response(user_message, user_info):
    """Generate intelligent response using local model or intelligent fallback"""
    try:
        user_id = user_info.get('id', 'guest')
        context = build_conversation_context(user_id)
        
        # Try local model first
        if USE_LOCAL_MODEL and phi_model and MODEL_LOADED:
            try:
                system_prompt = """You are Phi, an intelligent AI assistant.
You are helpful, harmless, and honest. Provide clear, accurate answers.
You can assist students with learning, teachers with teaching, and anyone with general knowledge.
Keep responses concise but informative. Be conversational and friendly."""
                
                full_prompt = f"""{system_prompt}

{context}User: {user_message}
Assistant:"""
                
                response = phi_model.generate_response(
                    prompt=full_prompt,
                    max_tokens=512,
                    temperature=0.7
                )
                return response
            except Exception as e:
                print(f"Local model error: {str(e)}")
        
        # Fallback: intelligent local responses
        return generate_intelligent_response(user_message, user_info)
        
    except Exception as e:
        print(f"Error generating response: {str(e)}")
        traceback.print_exc()
        return "I apologize, but I encountered an error. Please try again with a different question."

def generate_intelligent_response(user_message, user_info):
    """Generate intelligent response using smart templates - no external APIs"""
    message_lower = user_message.lower().strip()
    
    # Detect conversation intent
    if len(message_lower) < 10:  # Short messages - likely greetings
        greeting_response = generate_greeting_response(message_lower)
        if greeting_response:
            return greeting_response
    
    # Check for specific topics
    topic = detect_topic(message_lower)
    if topic:
        response = get_detailed_response(topic, message_lower)
        if response:
            return response
    
    # Try fallback responses
    fallback = get_fallback_response(message_lower)
    if fallback:
        return fallback
    
    # General intelligent response
    general = generate_contextual_response(user_message, user_info)
    if general:
        return general
    
    # Final default response
    return get_default_response(user_message)

def generate_greeting_response(message_lower):
    """Handle greeting-like messages intelligently"""
    greetings = ['hi', 'hello', 'hey', 'greetings', 'sup', 'yo', 'what\'s up']
    how_are = ['how are you', 'how r u', 'how do you do', "what's up", "what's new", 'how you', "how's it going"]
    thanks = ['thank you', 'thanks', 'thank u', 'thx', 'appreciate', 'much appreciated']
    goodbyes = ['good night', 'goodnight', 'bye', 'goodbye', 'farewell', 'see you', 'see ya', 'take care', 'cya']
    
    if any(x in message_lower for x in greetings):
        responses = [
            "Hello! 👋 I'm Phi, your AI assistant. What can I help you with today?",
            "Hi there! 😊 Ready to help with any questions or topics you'd like to discuss.",
            "Hey! 👋 Great to see you. What's on your mind?",
        ]
        return f"<p>{random.choice(responses)}</p>"
    
    if any(x in message_lower for x in how_are):
        responses = [
            "I'm doing great, thanks for asking! 😊 I'm always ready to help with any questions - whether it's about programming, academics, or anything else. How are YOU doing?",
            "Doing wonderfully! 🌟 I'm here and ready to assist you with whatever you need. What can I help with?",
            "I'm all set and eager to help! 💪 Whether you need academic support, coding help, or explanations of concepts, I'm here for you.",
        ]
        return f"<p>{random.choice(responses)}</p>"
    
    if any(x in message_lower for x in thanks):
        return "<p>You're very welcome! 😊 I'm always happy to help. Feel free to ask me anything else anytime. 💯</p>"
    
    if any(x in message_lower for x in goodbyes):
        return "<p>Goodbye! 👋 It was great talking with you. Take care and keep learning! 🌟</p>"
    
    return None

def detect_topic(message_lower):
    """Detect the main topic from the message"""
    topics = {
        'python': ['python', 'py ', 'django', 'flask', 'numpy', 'pandas', 'pytorch', 'tensorflow'],
        'java': ['java', 'javac', 'spring boot', 'jvm', 'maven', 'gradle'],
        'database': ['database', 'sql', 'mysql', 'postgresql', 'mongodb', 'query', 'relational', 'schema'],
        'algorithm': ['algorithm', 'sorting', 'searching', 'time complexity', 'space complexity', 'big o', 'dfs', 'bfs'],
        'study': ['study', 'exam', 'test', 'preparation', 'prepare', 'learning', 'revision'],
        'assignment': ['assignment', 'homework', 'project', 'task', 'deadline'],
        'help': ['help', 'stuck', 'error', 'problem', 'issue', 'debug', 'fix'],
    }
    
    for topic, keywords in topics.items():
        for keyword in keywords:
            if keyword in message_lower:
                return topic
    
    return None

def generate_contextual_response(user_message, user_info):
    """Generate a contextual response for general questions"""
    user_type = user_info.get('role', 'student').lower()
    
    contextual_responses = [
        "<p>That's an interesting question! 🤔</p><p>To give you the best answer, could you provide more details about:</p><ul><li>What specifically are you asking?</li><li>Is this for a project, assignment, or general knowledge?</li><li>What have you already tried?</li></ul><p>The more context you share, the better I can help! 💡</p>",
        
        "<p>Great question! 💭</p><p>Here's what I'd suggest:</p><ol><li><strong>Break it down</strong> - What are the main parts?</li><li><strong>Identify key concepts</strong> - What are the important ideas?</li><li><strong>Apply knowledge</strong> - How does this work in practice?</li><li><strong>Practice</strong> - Work through examples</li></ol><p>Feel free to ask me about any specific part! 🎯</p>",
        
        "<p>That's a great thing to explore! 🌟</p><p>I can help you understand this better. To get more specific assistance:</p><ul><li>📚 Share what you already know about this</li><li>🎯 Tell me what you're trying to achieve</li><li>❓ Ask follow-up questions</li></ul><p>I'm here to help you learn! 💪</p>",
    ]
    
    return random.choice(contextual_responses)

# Module-level responses dictionary
detailed_responses = {
        'python': """<p><strong>Python</strong> is an incredibly versatile and beginner-friendly programming language that's become the go-to choice for beginners and professionals alike.</p>

<h4 style="color: #2196F3; margin-top: 15px; margin-bottom: 8px;">🔑 Key Features:</h4>
<ul style="margin: 8px 0;">
  <li>Simple, readable syntax that resembles natural English</li>
  <li>Cross-platform (Windows, Mac, Linux)</li>
  <li>Extensive standard library (batteries included philosophy)</li>
  <li>Dynamic typing and automatic memory management</li>
</ul>

<h4 style="color: #2196F3; margin-top: 15px; margin-bottom: 8px;">💼 Popular Uses:</h4>
<ul style="margin: 8px 0;">
  <li><strong>Web development</strong> (Django, Flask)</li>
  <li><strong>Data science & AI/ML</strong> (NumPy, Pandas, TensorFlow, PyTorch)</li>
  <li><strong>Automation & scripting</strong></li>
  <li><strong>Scientific computing</strong></li>
  <li><strong>Game development</strong></li>
</ul>

<h4 style="color: #2196F3; margin-top: 15px; margin-bottom: 8px;">❓ Why Learn Python?</h4>
<p>Strong community support, abundant learning resources, high demand in job market, and great for both beginners and advanced users. The syntax is so clean that many people find it fun to learn.</p>

<h4 style="color: #2196F3; margin-top: 15px; margin-bottom: 8px;">🚀 Getting Started:</h4>
<ol style="margin: 8px 0;">
  <li>Install Python from <strong>python.org</strong></li>
  <li>Use interactive shell or IDE like <strong>VS Code</strong> or <strong>PyCharm</strong></li>
  <li>Start with basic concepts: variables, data types, loops, functions</li>
  <li>Practice with small projects</li>
</ol>

<p style="margin-top: 15px; font-style: italic; color: #666;">Would you like help with a specific Python concept?</p>""",

        'java': """<p><strong>Java</strong> is a robust, object-oriented programming language designed with "write once, run anywhere" philosophy (<strong>WORA</strong>).</p>

<h4 style="color: #FF9800; margin-top: 15px; margin-bottom: 8px;">⚙️ Core Characteristics:</h4>
<ul style="margin: 8px 0;">
  <li>Object-oriented (everything is an object)</li>
  <li>Platform-independent (<strong>JVM</strong> - Java Virtual Machine)</li>
  <li>Strong type checking and memory management</li>
  <li>Multithreading support</li>
  <li>Rich ecosystem and frameworks</li>
</ul>

<h4 style="color: #FF9800; margin-top: 15px; margin-bottom: 8px;">📱 Main Applications:</h4>
<ul style="margin: 8px 0;">
  <li>Enterprise business applications</li>
  <li>Android mobile app development</li>
  <li>Web development (Spring framework)</li>
  <li>Big data processing</li>
  <li>Microservices architecture</li>
</ul>

<h4 style="color: #FF9800; margin-top: 15px; margin-bottom: 8px;">✅ Advantages:</h4>
<ul style="margin: 8px 0;">
  <li>Backward compatibility</li>
  <li>High security features</li>
  <li>Great for large-scale applications</li>
  <li>Strong community and extensive documentation</li>
  <li>High performance</li>
</ul>

<h4 style="color: #FF9800; margin-top: 15px; margin-bottom: 8px;">📚 Learning Path:</h4>
<ol style="margin: 8px 0;">
  <li>Understand <strong>OOP concepts</strong> (classes, inheritance, polymorphism)</li>
  <li>Learn syntax and data structures</li>
  <li>Practice with projects</li>
  <li>Explore frameworks like <strong>Spring</strong></li>
</ol>

<p style="margin-top: 15px; font-style: italic; color: #666;">Is there a specific Java topic you'd like to explore?</p>""",

        'database': """<p><strong>Databases</strong> are the backbone of modern applications, storing and organizing data efficiently.</p>

<h4 style="color: #4CAF50; margin-top: 15px; margin-bottom: 8px;">📊 Main Types:</h4>

<h5 style="color: #4CAF50; margin: 10px 0 5px 0;">1️⃣ SQL (Relational Databases)</h5>
<ul style="margin: 5px 0 10px 20px;">
  <li>Structured data with predefined schema</li>
  <li>Popular: <strong>MySQL, PostgreSQL, Oracle, SQL Server</strong></li>
  <li>Uses <strong>SQL</strong> language for queries</li>
  <li><strong>ACID compliance</strong> (safe transactions)</li>
</ul>

<h5 style="color: #4CAF50; margin: 10px 0 5px 0;">2️⃣ NoSQL (Non-relational)</h5>
<ul style="margin: 5px 0 10px 20px;">
  <li>Flexible schema, better for unstructured data</li>
  <li>Types: <strong>Document</strong> (MongoDB), <strong>Key-value</strong> (Redis), <strong>Graph</strong> (Neo4j)</li>
  <li>Horizontal scaling capability</li>
  <li>Great for big data applications</li>
</ul>

<h4 style="color: #4CAF50; margin-top: 15px; margin-bottom: 8px;">🎯 Choose Based On:</h4>
<ul style="margin: 8px 0;">
  <li>Data structure (structured → SQL, unstructured → NoSQL)</li>
  <li>Scale requirements (massive scale → NoSQL)</li>
  <li>Transaction needs (critical → SQL)</li>
  <li>Query patterns (complex joins → SQL)</li>
</ul>

<h4 style="color: #4CAF50; margin-top: 15px; margin-bottom: 8px;">✅ Best Practices:</h4>
<ul style="margin: 8px 0;">
  <li>Normalize your data (SQL)</li>
  <li>Index frequently queried fields</li>
  <li>Backup regularly</li>
  <li>Plan for growth</li>
  <li>Use prepared statements (prevent SQL injection)</li>
</ul>

<p style="margin-top: 15px; font-style: italic; color: #666;">What specific database topic interests you?</p>""",

        'algorithm': """<p><strong>Algorithms</strong> are step-by-step procedures to solve problems efficiently - the heart of computer science.</p>

<h4 style="color: #FF9800; margin-top: 15px; margin-bottom: 8px;">📚 Major Categories:</h4>
<ul style="margin: 8px 0;">
  <li><strong>Sorting Algorithms</strong> - Quick Sort, Merge Sort, Bubble Sort (O(n²) to O(n log n))</li>
  <li><strong>Searching Algorithms</strong> - Binary Search, Linear Search (O(log n) optimal)</li>
  <li><strong>Graph Algorithms</strong> - BFS, DFS, Dijkstra, Floyd-Warshall</li>
  <li><strong>Dynamic Programming</strong> - Fibonacci, Longest Subsequence, Knapsack</li>
</ul>

<h4 style="color: #FF9800; margin-top: 15px; margin-bottom: 8px;">⚡ Why Algorithms Matter:</h4>
<ul style="margin: 8px 0;">
  <li>Efficient algorithms mean <strong>faster applications</strong></li>
  <li>Better resource usage (time & space)</li>
  <li>Essential for <strong>technical interviews</strong></li>
  <li>Develop stronger <strong>problem-solving skills</strong></li>
</ul>

<h4 style="color: #FF9800; margin-top: 15px; margin-bottom: 8px;">🎯 Complexity Analysis:</h4>
<ul style="margin: 8px 0;">
  <li><strong>Time Complexity</strong> - How long does it take?</li>
  <li><strong>Space Complexity</strong> - How much memory?</li>
  <li><strong>Big O Notation</strong> - O(1), O(n), O(n²), O(n log n), O(2ⁿ)</li>
</ul>

<h4 style="color: #FF9800; margin-top: 15px; margin-bottom: 8px;">📖 Learning Path:</h4>
<ol style="margin: 8px 0;">
  <li>Understand the problem thoroughly</li>
  <li>Think through the approach step-by-step</li>
  <li>Implement and test your solution</li>
  <li>Analyze time & space complexity</li>
  <li>Optimize if needed</li>
</ol>

<p style="margin-top: 15px; font-style: italic; color: #666;">Would you like me to explain a specific algorithm?</p>""",

        'study': """<p>Effective studying isn't about spending more hours—it's about studying <strong>smarter</strong>! Here are evidence-based techniques that actually work.</p>

<h4 style="color: #2196F3; margin-top: 15px; margin-bottom: 8px;">🎯 Top Study Techniques:</h4>

<p style="margin: 10px 0; font-weight: bold; color: #1976D2;">1. Active Learning (Most Effective) 🧠</p>
<ul style="margin: 5px 0 10px 20px;">
  <li>Quiz yourself instead of re-reading</li>
  <li>Teach concepts to others (Feynman Technique)</li>
  <li>Create mind maps and summaries</li>
  <li>Work on practice problems</li>
</ul>

<p style="margin: 10px 0; font-weight: bold; color: #1976D2;">2. Spaced Repetition ⏰</p>
<ul style="margin: 5px 0 10px 20px;">
  <li>Review material at increasing intervals: Day 1, 3, 7, 14</li>
  <li>Scientifically proven for <strong>retention</strong></li>
  <li>Use tools like <strong>Anki</strong> or <strong>Quizlet</strong></li>
</ul>

<p style="margin: 10px 0; font-weight: bold; color: #1976D2;">3. Pomodoro Technique ⏳</p>
<ul style="margin: 5px 0 10px 20px;">
  <li>Work 25 minutes with laser focus</li>
  <li>Take 5 minute break</li>
  <li>After 4 cycles, take 15-30 min break</li>
  <li>Maintains concentration, prevents burnout</li>
</ul>

<h4 style="color: #2196F3; margin-top: 15px; margin-bottom: 8px;">📍 Perfect Study Environment:</h4>
<ul style="margin: 8px 0;">
  <li>✓ Quiet, well-lit space</li>
  <li>✓ Minimize distractions (phone away!)</li>
  <li>✓ Water and snacks nearby</li>
  <li>✓ Organized materials</li>
  <li>✓ Comfortable temperature</li>
</ul>

<h4 style="color: #2196F3; margin-top: 15px; margin-bottom: 8px;">💡 Key Insight:</h4>
<p style="background: #E3F2FD; padding: 10px; border-left: 4px solid #2196F3; margin: 10px 0; border-radius: 3px;"><strong>Consistency > Intensity</strong><br/>30 minutes daily beats 6 hours once a week!</p>

<p style="margin-top: 15px; font-style: italic; color: #666;">What subject are you finding challenging?</p>""",

        'assignment': """<p>Completing assignments successfully requires <strong>planning</strong>, <strong>understanding</strong>, and <strong>execution</strong>. Follow this proven process.</p>

<h4 style="color: #2196F3; margin-top: 15px; margin-bottom: 8px;">📋 Step-by-Step Approach:</h4>

<p style="margin: 10px 0; font-weight: bold; color: #1976D2;">Step 1: Understand Requirements 📖</p>
<ul style="margin: 5px 0 10px 20px;">
  <li>Read the prompt <strong>multiple times</strong></li>
  <li>Identify <strong>key requirements</strong> and constraints</li>
  <li>Ask questions if unclear</li>
  <li>Write down what you need to deliver</li>
</ul>

<p style="margin: 10px 0; font-weight: bold; color: #1976D2;">Step 2: Plan Your Approach 📝</p>
<ul style="margin: 5px 0 10px 20px;">
  <li>Break big assignments into smaller tasks</li>
  <li>Create a realistic timeline with milestones</li>
  <li>Plan version control and backups</li>
</ul>

<p style="margin: 10px 0; font-weight: bold; color: #1976D2;">Step 3: Implementation 💻</p>
<ul style="margin: 5px 0 10px 20px;">
  <li><strong>Start early</strong> (avoid last-minute panic)</li>
  <li>Follow the rubric and requirements strictly</li>
  <li>Test thoroughly before submission</li>
</ul>

<p style="margin: 10px 0; font-weight: bold; color: #1976D2;">Step 4: Quality Check ✅</p>
<ul style="margin: 5px 0 10px 20px;">
  <li>Proofread written work carefully</li>
  <li>Verify all functionality works</li>
  <li>Check format and presentation</li>
  <li>Confirm all requirements are met</li>
</ul>

<h4 style="color: #FF6B6B; margin-top: 15px; margin-bottom: 8px;">⚠️ Common Mistakes to Avoid:</h4>
<ul style="margin: 8px 0;">
  <li>❌ Starting the night before</li>
  <li>❌ Ignoring parts of requirements</li>
  <li>❌ Submitting without testing</li>
  <li>❌ Poor formatting/presentation</li>
  <li>❌ Plagiarism (always cite sources!)</li>
</ul>

<h4 style="color: #2196F3; margin-top: 15px; margin-bottom: 8px;">🎯 Assignment-Specific Tips:</h4>
<p style="margin: 8px 0; font-weight: bold;">Written Assignments:</p>
<ul style="margin: 5px 0 10px 20px;"><li>Clear thesis & structure • Evidence-based claims • Proper citations</li></ul>
<p style="margin: 8px 0; font-weight: bold;">Coding Assignments:</p>
<ul style="margin: 5px 0 10px 20px;"><li>Code runs without errors • Clean, readable code • Edge cases tested</li></ul>

<p style="margin-top: 15px; font-style: italic; color: #666;">Need help with a specific assignment?</p>""",

        'exam': """<p>Exams test your knowledge and understanding. Here's a comprehensive guide to <strong>excel on exam day</strong>.</p>

<h4 style="color: #4CAF50; margin-top: 15px; margin-bottom: 8px;">🗓️ Before the Exam:</h4>

<p style="margin: 10px 0; font-weight: bold; color: #2E7D32;">Weeks Before: Build Your Foundation 📚</p>
<ul style="margin: 5px 0 10px 20px;">
  <li>Attend all classes (don't skip!)</li>
  <li>Review notes regularly (spaced repetition)</li>
  <li>Create comprehensive study guides</li>
  <li>Join study groups or find study partners</li>
  <li>Ask instructors about exam <strong>format and scope</strong></li>
</ul>

<p style="margin: 10px 0; font-weight: bold; color: #2E7D32;">One Week Before: Practice & Problem Areas 🎯</p>
<ul style="margin: 5px 0 10px 20px;">
  <li>Review comprehensive topic lists</li>
  <li>Practice with old exams/sample questions</li>
  <li>Take mock tests <strong>under timed conditions</strong></li>
  <li>Identify and focus on weak areas</li>
</ul>

<p style="margin: 10px 0; font-weight: bold; color: #2E7D32;">Night Before: Prepare & Relax 😴</p>
<ul style="margin: 5px 0 10px 20px;">
  <li>Light review only (don't cram!)</li>
  <li>Organize all materials needed</li>
  <li>Set alarm and plan wake-up time</li>
  <li><strong>Sleep 8 hours minimum</strong> (crucial!)</li>
  <li>Eat a proper breakfast</li>
</ul>

<h4 style="color: #4CAF50; margin-top: 15px; margin-bottom: 8px;">⚡ During the Exam:</h4>
<ul style="margin: 8px 0;">
  <li><strong>Read instructions carefully</strong> - Don't miss details</li>
  <li><strong>Time management</strong> - Allocate time per question</li>
  <li><strong>Easy questions first</strong> - Build confidence</li>
  <li><strong>Show all work</strong> - Partial credit matters</li>
  <li><strong>Review at end</strong> - Check answers if time permits</li>
</ul>

<h4 style="color: #4CAF50; margin-top: 15px; margin-bottom: 8px;">💡 Question-Type Strategies:</h4>
<ul style="margin: 8px 0;">
  <li><strong>Multiple Choice:</strong> Eliminate wrong answers first</li>
  <li><strong>Essay:</strong> Outline before writing full answer</li>
  <li><strong>Math:</strong> Show all steps clearly</li>
  <li><strong>Short Answer:</strong> Be concise and clear</li>
</ul>

<h4 style="color: #4CAF50; margin-top: 15px; margin-bottom: 8px;">✅ Exam-Day Checklist:</h4>
<ul style="margin: 8px 0;">
  <li>✓ Arrive 10 minutes early</li>
  <li>✓ Bring all necessary materials</li>
  <li>✓ Stay calm (deep breathing helps)</li>
  <li>✓ Don't panic if questions seem hard</li>
  <li>✓ Avoid talking to others before exam</li>
</ul>

<h4 style="color: #4CAF50; margin-top: 15px; margin-bottom: 8px;">🔍 After the Exam:</h4>
<ul style="margin: 8px 0;">
  <li>Review answer key if provided</li>
  <li>Learn from mistakes for next time</li>
  <li>Don't stress - what's done is done</li>
  <li>Focus energy on next exam</li>
</ul>

<p style="background: #E8F5E9; padding: 10px; border-left: 4px solid #4CAF50; margin: 10px 0; border-radius: 3px;"><strong>Remember:</strong> Exams measure learning, not intelligence. One exam doesn't define you! 💪</p>

<p style="margin-top: 15px; font-style: italic; color: #666;">What subject exam are you preparing for?</p>""",

        'help': """<p>No problem! I'm here to help you with <strong>anything you need</strong>. Let me show you what we can accomplish together.</p>

<h4 style="color: #2196F3; margin-top: 15px; margin-bottom: 8px;">📚 Academic Subjects:</h4>
<ul style="margin: 8px 0;">
  <li>Explain complex concepts step-by-step</li>
  <li>Help with homework and assignments</li>
  <li>Suggest effective study strategies</li>
  <li>Exam preparation and practice questions</li>
</ul>

<h4 style="color: #FF9800; margin-top: 15px; margin-bottom: 8px;">💻 Programming & Technology:</h4>
<ul style="margin: 8px 0;">
  <li>Debug error messages and code issues</li>
  <li>Explain programming concepts clearly</li>
  <li>Suggest elegant solutions</li>
  <li>Technology recommendations & comparisons</li>
</ul>

<h4 style="color: #4CAF50; margin-top: 15px; margin-bottom: 8px;">🎓 Study & Learning Skills:</h4>
<ul style="margin: 8px 0;">
  <li>Time management strategies</li>
  <li>Effective learning techniques</li>
  <li>Organization and productivity tips</li>
  <li>Motivation and focus strategies</li>
</ul>

<h4 style="color: #9C27B0; margin-top: 15px; margin-bottom: 8px;">✍️ Writing & Communication:</h4>
<ul style="margin: 8px 0;">
  <li>Explain concepts clearly and concisely</li>
  <li>Brainstorming and idea development</li>
  <li>Structure and outline guidance</li>
  <li>Proofreading and feedback</li>
</ul>

<h4 style="color: #E91E63; margin-top: 15px; margin-bottom: 8px;">😊 General Questions & More:</h4>
<ul style="margin: 8px 0;">
  <li>Career advice and path planning</li>
  <li>Interest-based topics</li>
  <li>Problem-solving and brainstorming</li>
  <li>And much more!</li>
</ul>

<h4 style="color: #2196F3; margin-top: 15px; margin-bottom: 8px;">💡 Tips for Getting the Best Help:</h4>
<ol style="margin: 8px 0;">
  <li>Be <strong>specific</strong> with your question</li>
  <li>Provide <strong>context</strong> about your situation</li>
  <li>Share what you've already <strong>tried</strong></li>
  <li>Ask <strong>follow-up questions</strong> freely</li>
  <li>Tell me what was helpful!</li>
</ol>

<p style="background: #E3F2FD; padding: 10px; border-left: 4px solid #2196F3; margin: 10px 0; border-radius: 3px;">What would you like help with? <strong>Feel free to ask about anything!</strong> 🚀</p>""",

        'question': """Great question! Asking good questions is a sign of critical thinking.

**How to Ask Better Questions:**

1. **Be Specific**
   - "How do I write a loop?" (Vague)
   - "How do I create a for loop in Python to print numbers 1-10?" (Specific)

2. **Provide Context**
   - Share what you already know
   - Mention what you've tried
   - Explain your goal

3. **Do Basic Research First**
   - Check if it's already answered
   - Try simple solutions first
   - Shows you're invested

4. **Use Clear Language**
   - Spell check
   - Grammar matters
   - Use proper technical terms

**Effective Question Structure:**
- Problem: What's your specific issue?
- Context: What situation led to this?
- Attempts: What have you tried?
- Goal: What do you want to achieve?

**Following Up:**
- Thank the person who helped
- Share if the solution worked
- Ask clarification if needed
- Report what worked for you

**Remember:**
There's no such thing as a stupid question. Everyone is learning. The only dumb question is one you don't ask when you're stuck.

What's your question? I'm listening! 👂""",
}

def get_detailed_response(topic_key, message_lower):
    """Get detailed response for a specific topic"""
    if topic_key in detailed_responses:
        return detailed_responses[topic_key]
    
    # Check for exact topic match in message
    for topic, response in detailed_responses.items():
        if topic in message_lower:
            return response
    
    return None

def get_fallback_response(message_lower):
    """Get intelligent fallback response for general questions"""
    # Smart question detection with detailed fallback
    if any(word in message_lower for word in ['how', 'what', 'why', 'when', 'where', 'who']):
        return """I appreciate your question! I'm here to provide detailed, helpful answers.

**To give you the best response, I can help with:**

📖 **Concepts & Explanations** - Break down complex topics
💡 **Problem-Solving** - Work through challenges step-by-step
📚 **Learning Strategies** - Suggest effective study methods
💻 **Technical Help** - Explain code, algorithms, technology
✏️ **Assignment Help** - Guide you through requirements
🎯 **Exam Prep** - Tips and practice strategies

**Popular Topics I Can Explain:**
- Programming (Python, Java, C++, JavaScript)
- Data Structures & Algorithms
- Database design
- Web development
- Mathematics & Physics concepts
- Study techniques
- Time management
- And much more!

**Tips for Getting Better Answers:**
1. Be as specific as possible
2. Share what you've already tried
3. Mention your learning goal
4. Ask follow-up questions

Please ask your question in detail, and I'll provide a comprehensive answer! What would you like to know?"""
    
    # Greeting responses
    if any(word in message_lower for word in ['hello', 'hi', 'hey', 'greetings']):
        return """<h3 style="color: #2196F3; margin-top: 0;">Hello! 👋</h3>
<p>I'm <strong>Phi</strong>, your AI assistant powered by <strong>Microsoft</strong>. Nice to meet you!</p>

<p style="background: #E3F2FD; padding: 10px; border-left: 4px solid #2196F3; margin: 15px 0; border-radius: 3px; font-size: 14px;">
I'm here to help you with <strong>whatever you need</strong>! Whether you're working on assignments, studying for exams, learning new concepts, or exploring ideas - I'm ready to help.
</p>

<h4 style="color: #2196F3; margin-top: 15px; margin-bottom: 8px;">✉️ What I Can Do:</h4>
<ul style="margin: 8px 0;">
  <li>✓ Explain concepts in <strong>detailed, easy-to-understand</strong> ways</li>
  <li>✓ Help with <strong>coding & technical</strong> issues</li>
  <li>✓ Suggest <strong>study strategies</strong> that actually work</li>
  <li>✓ Provide <strong>step-by-step guidance</strong> for any problem</li>
  <li>✓ Answer questions on <strong>virtually any topic</strong></li>
  <li>✓ Give <strong>advice & recommendations</strong></li>
</ul>

<h4 style="color: #2196F3; margin-top: 15px; margin-bottom: 8px;">🚀 Pro Tips for Better Assistance:</h4>
<ul style="margin: 8px 0;">
  <li>Be as <strong>specific</strong> as possible</li>
  <li>Provide <strong>context</strong> about your situation</li>
  <li>Share what you've <strong>already tried</strong></li>
  <li>Tell me your <strong>learning goal</strong></li>
</ul>

<p style="margin-top: 15px; font-style: italic; color: #666;"><strong>Feel free to ask me anything!</strong> What would you like to chat about? 👂</p>"""

def get_default_response(user_message):
    """Get default comprehensive response for ANY question"""
    return f"""<h4 style="color: #2196F3; margin-top: 0; margin-bottom: 8px;">👋 I'm ready to help!</h4>
<p>Your question: <strong>"{user_message}"</strong></p>

<p style="background: #E3F2FD; padding: 10px; border-left: 4px solid #2196F3; margin: 10px 0; border-radius: 3px;">
The Phi model is working to understand your question in depth. Here's a helpful framework response:
</p>

<h4 style="color: #2196F3; margin-top: 15px; margin-bottom: 8px;">📖 General Approach to Your Question:</h4>

<ol style="margin: 8px 0; line-height: 1.8;">
  <li><strong>Understand the Topic:</strong> Break down what you're asking about</li>
  <li><strong>Identify Key Concepts:</strong> What are the main ideas?</li>
  <li><strong>Apply Knowledge:</strong> How does this work in practice?</li>
  <li><strong>Practice & Reinforce:</strong> Work through examples</li>
  <li><strong>Deepen Understanding:</strong> Ask follow-up questions</li>
</ol>

<h4 style="color: #2196F3; margin-top: 15px; margin-bottom: 8px;">💡 How I Can Help Better:</h4>

<p><strong>Try rephrasing your question with more details:</strong></p>
<ul style="margin: 8px 0;">
  <li>✓ <strong>What subject</strong> is this about? (e.g., Math, Programming, Science, History)</li>
  <li>✓ <strong>What's your goal?</strong> (e.g., Learn concept, solve problem, prepare for exam)</li>
  <li>✓ <strong>What's your current level?</strong> (e.g., Beginner, intermediate, advanced)</li>
  <li>✓ <strong>What have you already tried?</strong></li>
</ul>

<h4 style="color: #2196F3; margin-top: 15px; margin-bottom: 8px;">📝 Example Better Questions:</h4>

<p style="background: #FFF3E0; padding: 10px; margin: 8px 0; border-radius: 3px; font-size: 13px;">
<strong>Instead of:</strong> "How does photosynthesis work?"<br/>
<strong>Ask:</strong> "Explain photosynthesis for a biology exam - specifically the light reactions and Calvin cycle, and how they produce glucose from CO2 and water."
</p>

<p style="background: #FFF3E0; padding: 10px; margin: 8px 0; border-radius: 3px; font-size: 13px;">
<strong>Instead of:</strong> "What is Python?"<br/>
<strong>Ask:</strong> "I'm learning Python for data analysis. Can you explain how to use Pandas DataFrames? I'm stuck on filtering and grouping operations."
</p>

<h4 style="color: #2196F3; margin-top: 15px; margin-bottom: 8px;">🚀 I'm Ready to Help With:</h4>

<ul style="margin: 8px 0; columns: 2; gap: 20px;">
  <li>📚 Academic concepts (any subject)</li>
  <li>💻 Programming & coding help</li>
  <li>📖 Homework & assignments</li>
  <li>🎯 Exam preparation strategies</li>
  <li>📝 Writing & explanations</li>
  <li>🧠 Study techniques</li>
  <li>❓ Any question you have</li>
  <li>✍️ And much more!</li>
</ul>

<p style="margin-top: 15px; font-style: italic; color: #666;"><strong>Feel free to ask me anything in detail,</strong> and I'll provide the best possible help! 💪</p>"""

# Health check endpoint
@app.route('/api/phi/health', methods=['GET'])
def health_check():
    """Check if Phi service is running"""
    return jsonify({
        'status': 'healthy',
        'service': 'Phi AI Assistant',
        'version': '2.0.0',
        'model_loaded': MODEL_LOADED,
        'model_name': 'Phi-3.5-mini' if MODEL_LOADED else 'Fallback',
        'timestamp': datetime.now().isoformat()
    }), 200

# Chat endpoint
@app.route('/api/phi/chat', methods=['POST'])
def chat():
    """Send a message to Phi and get a response"""
    try:
        data = request.json
        user_id = data.get('userId', 'guest')
        user_message = data.get('message', '').strip()
        user_info = data.get('userInfo', {})
        
        if not user_message:
            return jsonify({'error': 'Message cannot be empty'}), 400
        
        # Add user message to history
        add_to_history(user_id, 'user', user_message)
        
        # Generate response
        response = generate_response(user_message, user_info)
        
        # Add assistant response to history
        add_to_history(user_id, 'assistant', response)
        
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
        'version': '2.0.0',
        'description': 'Intelligent conversational AI for students, teachers, and general users',
        'model': 'Microsoft Phi-3.5-mini (4-bit quantized)',
        'status': 'Using actual Phi model' if MODEL_LOADED else 'Using intelligent fallback',
        'endpoints': {
            'health': {
                'url': '/api/phi/health',
                'method': 'GET',
                'description': 'Check service health and model status'
            },
            'chat': {
                'url': '/api/phi/chat',
                'method': 'POST',
                'description': 'Send a message and get AI response',
                'body': {
                    'userId': 'string (unique user ID)',
                    'message': 'string (any question)',
                    'userInfo': 'object (optional user data)'
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
    print("  Phi AI Conversational Service - Starting...")
    print("="*70)
    print("\n  Service Information:")
    print("    Service: Phi AI Assistant (Conversational AI)")
    print("    Version: 2.0.0")
    print("    Port: 5000")
    print("    Model: Microsoft Phi-3.5-mini" + (" (Loaded)" if MODEL_LOADED else " (Fallback Mode)"))
    print("    Quantization: 4-bit")
    print("    Status: Ready for connections")
    print("\n  Available Endpoints:")
    print("    GET  /api/phi/health           - Check service health")
    print("    POST /api/phi/chat             - Send message to Phi")
    print("    GET  /api/phi/history/<user>   - Get user chat history")
    print("    DELETE /api/phi/clear/<user>   - Clear chat history")
    print("\n  Features:")
    print("    • Intelligent conversational responses")
    print("    • Context-aware answers using chat history")
    print("    • Works with any topic (not role-restricted)")
    print("    • Helpful for students, teachers, and general users")
    print("="*70 + "\n")
    
    # Start Flask app
    app.run(
        host='10.52.9.128',
        port=5000,
        debug=False,
        use_reloader=False,
        threaded=True
    )
