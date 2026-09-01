# ml/ — Issue Category Classifier

Trains a model that predicts an issue's `category` (bug / feature / question /
documentation) from its title and description text. This is the model that
will power DevFlow AI's auto-categorization feature — the `category` field
already exists on the `Issue` model but nothing sets it yet; this is step one
toward filling it in automatically.

## Dataset

`data/issues_dataset.csv` — 220 rows, hand-templated by combining realistic
issue phrasing (component names + common bug/feature/question/doc patterns)
across 4 balanced classes (55 each). Built with `generate_dataset.py`. This
is synthetic, not scraped from real GitHub issues, so the vocabulary is more
consistent than real-world text would be — see the honest note on accuracy
below.

10 rows also have a deliberately blank `description` to mimic real submissions
where users only fill in a title, plus additional blanks that came from the
templates themselves (45 total missing descriptions after generation).

## Workflow

1. **Load & clean** (`train.py`) — load the CSV with Pandas, drop rows
   missing a title (none in practice), fill missing descriptions with `""`
   since that's the app's own default for that field, then combine
   `title + description` into a single text feature.
2. **Split** — 80/20 train/test split, stratified by category so each class
   is proportionally represented in both sets.
3. **Train** — TF-IDF vectorization (unigrams + bigrams, stopwords removed)
   feeding into two candidate classifiers: Logistic Regression and Multinomial
   Naive Bayes.
4. **Evaluate** — accuracy, full precision/recall/F1 classification report,
   and a confusion matrix for both models.
5. **Save** — the better-performing model is saved to
   `model/issue_classifier.joblib` with `joblib`.

## Results

Both models tied at **97.7% accuracy** on the 44-row test set. Logistic
Regression was saved as the model to serve (arbitrary tiebreak — see
interpretation below on why the tie isn't surprising).

```
               precision    recall  f1-score   support
          bug       1.00      1.00      1.00        11
documentation       1.00      1.00      1.00        11
      feature       0.92      1.00      0.96        11
     question       1.00      0.91      0.95        11
```

Confusion matrix (rows = actual, columns = predicted; labels in order
`[bug, documentation, feature, question]`):

```
[[11  0  0  0]
 [ 0 11  0  0]
 [ 0  0 11  0]
 [ 0  0  1 10]]
```

Only one error in the whole test set: a `question` issue predicted as
`feature`.

## Honest interpretation

97.7% accuracy is high enough to be suspicious, and it is: this dataset is
synthetic and templated, so each category has a fairly narrow, distinct
vocabulary ("crashes", "throws an error" for bugs; "add support for", "allow
users to" for features). Real GitHub issue text would be far messier —
overlapping phrasing, typos, mixed intent in one issue — and I'd expect
accuracy to drop noticeably on real data. Both models tying at the same score
supports this: when classes are this cleanly separable, a simple model like
Naive Bayes can match a more expressive one like Logistic Regression, because
the problem doesn't require much nuance to solve.

Running `predict.py` on genuinely new phrasing (not from the training
templates) confirms this — one sample ("README doesn't explain how to set up
the MongoDB connection") was misclassified as `question` instead of
`documentation`, since it phrases a documentation complaint using
question-like wording. That's a more realistic failure mode.

**One idea to improve it:** replace the synthetic dataset with a sample of
real GitHub issues (public repos expose these via the GitHub API) to get more
natural, overlapping language, and add more classes or ambiguous edge cases
that mix intent (e.g. "this crashes AND the docs don't cover it") to force the
model to actually weigh evidence instead of pattern-matching a template.

## Running it

```bash
cd ml
pip install -r requirements.txt

python generate_dataset.py   # regenerate the dataset (optional, already committed)
python train.py              # train, evaluate, save the model
python predict.py            # reload the saved model and predict on sample issues
python predict.py "Some new issue text here"   # predict on custom text
```
