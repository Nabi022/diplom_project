from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline, T5ForConditionalGeneration
import torch

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def load_paraphraser():
    tokenizer = AutoTokenizer.from_pretrained("cointegrated/rut5-base-paraphraser", use_fast=False)
    model = AutoModelForSeq2SeqLM.from_pretrained("cointegrated/rut5-base-paraphraser").to(device)
    return tokenizer, model

def load_summarizer():
    tokenizer = AutoTokenizer.from_pretrained("cointegrated/rut5-base-absum")
    model = AutoModelForSeq2SeqLM.from_pretrained("cointegrated/rut5-base-absum").to(device)
    return tokenizer, model

def load_question_generator():
    tokenizer = AutoTokenizer.from_pretrained("hivaze/AAQG-QA-QG-FRED-T5-1.7B")
    model = T5ForConditionalGeneration.from_pretrained("hivaze/AAQG-QA-QG-FRED-T5-1.7B").to(device)
    return tokenizer, model

def load_qa_pipeline():
    return pipeline(
        "question-answering",
        model="AlexKay/xlm-roberta-large-qa-multilingual-finedtuned-ru",
        tokenizer="AlexKay/xlm-roberta-large-qa-multilingual-finedtuned-ru",
        device=0 if torch.cuda.is_available() else -1
    )
