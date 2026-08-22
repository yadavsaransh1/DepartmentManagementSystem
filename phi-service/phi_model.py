import torch  # type: ignore
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig  # type: ignore
import os

class PhiModel:
    def __init__(self):
        model_name = "microsoft/Phi-3.5-mini-instruct"
        
        print("=" * 60)
        print("🔄 Loading Phi-3.5-mini model (4-bit quantization)...")
        print("=" * 60)
        print("⏳ First load will download ~3.8GB")
        print("   This takes 5-10 minutes on first run...")
        print("=" * 60)
        
        # 4-bit quantization for optimal RAM usage (2-3GB instead of 8GB)
        quantization_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_use_double_quant=True,
            bnb_4bit_quant_type="nf4"
        )
        
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForCausalLM.from_pretrained(
                model_name,
                quantization_config=quantization_config,
                device_map="auto",
                trust_remote_code=True,
                attn_implementation="flash_attention_2"
            )
            
            print("\n✅ Model loaded successfully!")
            print("📊 Running in 4-bit quantization mode")
            print("💾 RAM Usage: ~2-3 GB")
            print("=" * 60 + "\n")
            
        except Exception as e:
            print(f"\n❌ Error loading model: {e}")
            raise
    
    def generate_response(self, prompt, max_tokens=300):
        """
        Generate response from Phi model
        
        Args:
            prompt: User question/context
            max_tokens: Max response length (default 300)
        
        Returns:
            Generated text response
        """
        try:
            inputs = self.tokenizer(prompt, return_tensors="pt")
            
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=max_tokens,
                    temperature=0.7,
                    top_p=0.95,
                    do_sample=True,
                    pad_token_id=self.tokenizer.eos_token_id
                )
            
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Extract just the assistant's response
            if "Assistant:" in response:
                response = response.split("Assistant:")[-1].strip()
            
            return response
        
        except Exception as e:
            print(f"❌ Error generating response: {e}")
            return f"I encountered an error processing your request: {str(e)}"

# Create global instance
print("\nInitializing Phi AI Model Service...")
phi_model = PhiModel()
