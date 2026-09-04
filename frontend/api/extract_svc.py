import pickle
import json
import numpy as np

with open(r"e:\SehatSaathi AI\frontend\api\models\svc.pkl", "rb") as f:
    model = pickle.load(f)

print("Kernel:", model.kernel)
if model.kernel == 'linear':
    print("Classes:", model.classes_.tolist())
    print("Coef shape:", model.coef_.shape)
    print("Intercept shape:", model.intercept_.shape)
else:
    print("Non-linear kernel. Needs different extraction.")
