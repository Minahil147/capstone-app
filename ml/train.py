import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
)
import joblib


def load_and_clean(path="data/issues_dataset.csv"):
    df = pd.read_csv(path)

    print("Loaded", len(df), "rows")
    print("\nMissing values per column:")
    print(df.isna().sum())

    df = df.dropna(subset=["title"])

    df["description"] = df["description"].fillna("")

    df["text"] = (df["title"] + " " + df["description"]).str.strip()

    return df


def main():
    df = load_and_clean()

    X = df["text"]
    y = df["category"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"\nTrain size: {len(X_train)}, Test size: {len(X_test)}")

    candidates = {
        "logistic_regression": LogisticRegression(max_iter=1000),
        "naive_bayes": MultinomialNB(),
    }

    results = {}
    fitted_pipelines = {}

    for name, clf in candidates.items():
        pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(stop_words="english", ngram_range=(1, 2), max_features=3000)),
            ("clf", clf),
        ])
        pipeline.fit(X_train, y_train)
        preds = pipeline.predict(X_test)

        acc = accuracy_score(y_test, preds)
        report = classification_report(y_test, preds, zero_division=0)
        cm = confusion_matrix(y_test, preds, labels=sorted(y.unique()))

        results[name] = {"accuracy": acc, "report": report, "confusion_matrix": cm, "preds": preds}
        fitted_pipelines[name] = pipeline

        print(f"\n{'=' * 60}")
        print(f"Model: {name}")
        print(f"{'=' * 60}")
        print(f"Accuracy: {acc:.3f}")
        print("\nClassification report (precision / recall / f1 per class):")
        print(report)
        print("Confusion matrix (rows = actual, columns = predicted):")
        print("Labels:", sorted(y.unique()))
        print(cm)

    best_name = max(results, key=lambda n: results[n]["accuracy"])
    best_pipeline = fitted_pipelines[best_name]

    print(f"\n{'=' * 60}")
    print(f"Comparison: {best_name} performed better "
          f"({results[best_name]['accuracy']:.3f} vs "
          f"{results['naive_bayes' if best_name == 'logistic_regression' else 'logistic_regression']['accuracy']:.3f})")
    print(f"Saving {best_name} as the model to serve.")
    print(f"{'=' * 60}")

    joblib.dump(best_pipeline, "model/issue_classifier.joblib")
    print("\nSaved trained model to model/issue_classifier.joblib")

    return results, best_name


if __name__ == "__main__":
    main()
