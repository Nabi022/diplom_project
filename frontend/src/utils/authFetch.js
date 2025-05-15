export async function authFetch(url, options = {}) {
    const access = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh");
  
    if (!options.headers) options.headers = {};
    options.headers["Authorization"] = `Bearer ${access}`;
    options.headers["Content-Type"] = "application/json";
  
    let response = await fetch(url, options);
  
    if (response.status === 401 && refresh) {
      const refreshResponse = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
  
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        localStorage.setItem("access", data.access);
  
        // Повтор запроса с новым токеном
        options.headers["Authorization"] = `Bearer ${data.access}`;
        response = await fetch(url, options);
      } else {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
      }
    }
  
    return response;
  }
  