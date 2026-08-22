"""
Phi-3.5-mini Model Loader with 4-bit Quantization
Downloads and initializes Microsoft's Phi-3.5-mini model for CPU/GPU inference
"""

import torch  # type: ignore
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig  # type: ignore
import warnings

warnings.filterwarnings('ignore')

class PhiModel:
    def __init__(self):
        """Initialize Phi-3.5-mini model with 4-bit quantization"""
        self.device = "cpu"
        self.model = None
        self.tokenizer = None
        self.model_name = "microsoft/Phi-3.5-mini-instruct"
        
        print("Loading Phi-3.5-mini model...")
        self.load_model()
    
    def load_model(self):
        """Load model with 4-bit quantization for efficient memory usage"""
        try:
            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name,
                trust_remote_code=True,
                padding_side="left"
            )
            
            # Configure 4-bit quantization to reduce memory from ~8GB to 2-3GB
            bnb_config = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_compute_dtype=torch.float16,
                bnb_4bit_use_double_quant=True,
                bnb_4bit_quant_type="nf4"
            )
            
            # Load model with 4-bit quantization
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                quantization_config=bnb_config,
                device_map="auto",
                trust_remote_code=True,
                attn_implementation="flash_attention_2"  # Faster attention mechanism
            )
            
            self.model.eval()  # Set to inference mode
            print("✓ Phi-3.5-mini model loaded successfully!")
            
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            raise
    
    def generate_response(self, prompt, max_tokens=512, temperature=0.7):
        """Generate response using Phi model
        
        Args:
            prompt: User question/message
            max_tokens: Maximum tokens to generate (default 512)
            temperature: Sampling temperature (0.0-1.0, higher = more creative)
        
        Returns:
            Generated response text
        """
        try:
            # Prepare input
            inputs = self.tokenizer(prompt, return_tensors="pt", padding=True)
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Generate with sampling
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=max_tokens,
                    temperature=temperature,
                    top_p=0.95,
                    top_k=50,
                    do_sample=True,
                    pad_token_id=self.tokenizer.eos_token_id,
                    eos_token_id=self.tokenizer.eos_token_id,
                )
            
            # Decode response
            response_text = self.tokenizer.decode(
                outputs[0][inputs['input_ids'].shape[1]:],
                skip_special_tokens=True
            ).strip()
            
            return response_text
            
        except Exception as e:
            print(f"Error generating response: {str(e)}")
            raise


# Initialize model on module load
try:
    phi_model = PhiModel()
    MODEL_LOADED = True
except Exception as e:
    print(f"Warning: Could not load Phi model: {str(e)}")
    phi_model = None
    MODEL_LOADED = False
