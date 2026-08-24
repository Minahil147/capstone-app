import sys
import joblib

MODEL_PATH = "model/issue_classifier.joblib"

SAMPLE_ISSUES = [
    "App crashes when I click submit twice on the signup form",
    "Add support for exporting the issue board to CSV",
    "How do I configure the JWT expiry time?",
    "README doesn't explain how to set up the MongoDB connection",
]


def predict(texts):
    model = joblib.load(MODEL_PATH)
    predictions = model.predict(texts)
    for text, label in zip(texts, predictions):
        print(f"  \"{text}\"\n  -> predicted category: {label}\n")


if __name__ == "__main__":
    if len(sys.argv) > 1:
       
        predict([" ".join(sys.argv[1:])])
    else:
        print("Loaded model from disk. Predicting on sample issues:\n")
        predict(SAMPLE_ISSUES)
