// auth.js

async function register() {
  const imageInput = document.getElementById("profileImage");
  const file = imageInput?.files?.[0];

  let imageBase64 = "";

  if (file) {
    try {
      imageBase64 = await fileToBase64(file);
    } catch (err) {
      alert("Could not read image. Please try a different file.");
      console.error(err);
      return;
    }
  }

  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: document.getElementById("username").value, 
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
      image: imageBase64
    })
  });

  const data = await res.json();
  alert(data.message);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function login() {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: document.getElementById("email").value,
      password: document.getElementById("password").value
    })
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem("token", data.token); 
    if (data.user) {
      localStorage.setItem("userImage", data.user.image || "");
      localStorage.setItem("userName", data.user.name || "");
    }
    window.location.href = "/index.html"; 
  } else {
    alert(data.message);
  }
}
