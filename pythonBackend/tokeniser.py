import spacy
from flask import Flask,request,jsonify
from flask_cors import CORS

app=Flask(__name__)
CORS(app)  # Enable CORS
nlp=spacy.load("en_core_web_sm")

@app.route("/analyse",methods=['POST'])
def analyse():
    if request.method=='POST':
        text=request.json.get("text")
        doc=nlp(text)

       # Collect all entities and their labels in a list
        entities = [{'text': ent.text, 'label': ent.label_} for ent in doc.ents]

        return jsonify(entities)


if __name__=="__main__":
    app.run()