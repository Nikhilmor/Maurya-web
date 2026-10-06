 function showPage(page) {
            document.getElementById("home").style.display = "none";
            document.getElementById("login").style.display = "none";
            document.getElementById("register").style.display = "none";
            document.getElementById("profile").style.display = "none";
            document.getElementById("massage").style.display = "none";
            document.getElementById("homepage").style.display = "none";
            document.getElementById("reel").style.display = "none";
            document.getElementById("create").style.display = "none";

            document.getElementById(page).style.display = "block";

            if (page === "home" || page === "login" || page === "register") {
                document.querySelector(".bottom-nav").style.display = "none";
            } else {
                document.querySelector(".bottom-nav").style.display = "flex";
            }

            document.querySelectorAll(".nav-item").forEach(function (item) {
                item.classList.remove("active");
            });

            if (page === "homepage") {
                document.querySelectorAll(".nav-item")[0].classList.add("active");
            } else if (page === "reel") {
                document.querySelectorAll(".nav-item")[1].classList.add("active");
            } else if (page === "create") {
                document.querySelectorAll(".nav-item")[2].classList.add("active");
            } else if (page === "massage") {
                document.querySelectorAll(".nav-item")[3].classList.add("active");
            } else if (page === "profile") {
                document.querySelectorAll(".nav-item")[4].classList.add("active");
            }
        }

        document.querySelector(".bottom-nav").style.display = "none";

        const canvas = document.getElementById("matrix");
        const ctx = canvas.getContext("2d");

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        resizeCanvas();

        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
        const fontSize = 16;
        let columns = Math.floor(canvas.width / fontSize);
        let drops = [];

        for (let i = 0; i < columns; i++) {
            drops[i] = Math.random() * -100;
        }

        function matrixRain() {
            ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = fontSize + "px monospace";

            for (let i = 0; i < drops.length; i++) {
                const character = characters[Math.floor(Math.random() * characters.length)];
                const x = i * fontSize;
                const y = drops[i] * fontSize;
                ctx.fillStyle = "#00ff41";
                ctx.fillText(character, x, y);
                drops[i]++;

                if (y > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
            }
        }

        setInterval(matrixRain, 40);

        window.addEventListener("resize", function () {
            resizeCanvas();
            columns = Math.floor(canvas.width / fontSize);
            drops = [];

            for (let i = 0; i < columns; i++) {
                drops[i] = Math.random() * -100;
            }
        });