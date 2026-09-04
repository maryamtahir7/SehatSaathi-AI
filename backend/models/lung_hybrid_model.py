import torch
import torch.nn as nn
from torchvision.models import resnet18
import pennylane as qml

n_qubits = 8
dev = qml.device("default.qubit", wires=n_qubits)

@qml.qnode(dev, interface="torch")
def vqc(inputs, weights):

    # Encode data
    for i in range(n_qubits):
        qml.RY(inputs[i], wires=i)

    # Variational layers
    for l in range(2):
        for i in range(n_qubits):
            qml.RY(weights[l, i], wires=i)

        for i in range(n_qubits - 1):
            qml.CNOT(wires=[i, i+1])

    return [qml.expval(qml.PauliZ(i)) for i in range(n_qubits)]

class HybridModel(nn.Module):
    def __init__(self):
        super().__init__()

        # CNN Backbone
        self.cnn = resnet18(weights=None)  # No need for pretrained weights for inference

        # Better feature reduction
        self.cnn.fc = nn.Sequential(
            nn.Linear(512, 128),
            nn.ReLU(),
            nn.Linear(128, n_qubits)
        )

        # Quantum weights
        self.q_weights = nn.Parameter(torch.randn(2, n_qubits))

        # Final classifier
        self.fc = nn.Sequential(
            nn.Linear(n_qubits, 64),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(64, 5)
        )

    def forward(self, x):
        x = self.cnn(x)

        # Quantum layer (batch processing)
        q_out = []
        for sample in x:
            q_out.append(torch.stack(vqc(sample, self.q_weights)).float())
        x = torch.stack(q_out)

        return self.fc(x)
