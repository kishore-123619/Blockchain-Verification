import fetch from "node-fetch";

async function testForgotPassword() {
  try {
    const response = await fetch(
      "http://localhost:5000/api/auth/forgotpassword",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "admin@university.edu" }),
      },
    );

    const data = await response.json();
    console.log("Response:", data);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testForgotPassword();
