const display = document.getElementById("display");
const message = document.getElementById("message");
const buttons = document.querySelector(".buttons");

let expression = "";

function updateDisplay() {
    display.value = expression || "0";
}

function showMessage(text = "") {
    message.textContent = text;
}

function appendValue(value) {
    expression += value;
    updateDisplay();
    showMessage();
}

function clearCalculator() {
    expression = "";
    updateDisplay();
    showMessage();
}

function deleteLast() {
    expression = expression.slice(0, -1);
    updateDisplay();
    showMessage();
}

function factorial(number) {
    if (!Number.isInteger(number) || number < 0 || number > 170) {
        throw new Error("Factorial requires an integer from 0 to 170.");
    }

    let result = 1;

    for (let i = 2; i <= number; i++) {
        result *= i;
    }

    return result;
}

function calculate() {
    if (!expression.trim()) {
        return;
    }

    try {
        let exp = expression;

        // Replace mathematical constants.
        exp = exp.replace(/\bpi\b/g, "PI");
        exp = exp.replace(/\be\b/g, "E");

        // Convert powers and square roots.
        exp = exp.replace(/\^/g, "**");

        // Convert factorials such as 5! into factorial(5).
        exp = exp.replace(
            /(\d+(?:\.\d+)?)!/g,
            "factorial($1)"
        );

        // Convert scientific functions into safe function calls.
        const allowedNames =
            /^(?:sin|cos|tan|log|ln|sqrt|abs|PI|E|factorial)$/;

        const identifiers = exp.match(/[a-zA-Z_]\w*/g) || [];

        if (!identifiers.every(name => allowedNames.test(name))) {
            throw new Error("Invalid expression.");
        }

        // Only allow mathematical expression characters.
        if (!/^[0-9a-zA-Z_+\-*/().%\s]+$/.test(exp)) {
            throw new Error("Invalid characters.");
        }

        // Trigonometric functions use degrees.
        const sin = x => Math.sin(x * Math.PI / 180);
        const cos = x => Math.cos(x * Math.PI / 180);
        const tan = x => Math.tan(x * Math.PI / 180);

        const log = x => {
            if (x <= 0) throw new Error("Log requires a positive number.");
            return Math.log10(x);
        };

        const ln = x => {
            if (x <= 0) throw new Error("Ln requires a positive number.");
            return Math.log(x);
        };

        const sqrt = x => {
            if (x < 0) throw new Error("Cannot take the square root of a negative number.");
            return Math.sqrt(x);
        };

        const abs = x => Math.abs(x);

        const PI = Math.PI;
        const E = Math.E;

        // Evaluate only after validating the expression and its names.
        const result = Function(
            "sin", "cos", "tan", "log", "ln",
            "sqrt", "abs", "factorial", "PI", "E",
            `"use strict"; return (${exp});`
        )(
            sin, cos, tan, log, ln,
            sqrt, abs, factorial, PI, E
        );

        if (typeof result !== "number" || !Number.isFinite(result)) {
            throw new Error("Result is not a finite number.");
        }

        expression = String(Number(result.toPrecision(12)));
        updateDisplay();
        showMessage();
    } catch (error) {
        showMessage(error.message || "Invalid calculation.");
    }
}

// Handle calculator button clicks.
buttons.addEventListener("click", event => {
    const button = event.target.closest("button");

    if (!button) return;

    const action = button.dataset.action;
    const value = button.dataset.value;

    if (action === "clear") {
        clearCalculator();
    } else if (action === "backspace") {
        deleteLast();
    } else if (action === "calculate") {
        calculate();
    } else if (value !== undefined) {
        appendValue(value);
    }
});

// Keyboard support.
document.addEventListener("keydown", event => {
    if (/^[0-9.]$/.test(event.key)) {
        appendValue(event.key);
    } else if (["+", "-", "*", "/", "(", ")", "%", "^", "!"].includes(event.key)) {
        appendValue(event.key);
    } else if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        calculate();
    } else if (event.key === "Backspace") {
        deleteLast();
    } else if (event.key === "Escape") {
        clearCalculator();
    }
});

updateDisplay();