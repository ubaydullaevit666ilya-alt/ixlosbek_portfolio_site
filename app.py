import os

from flask import Flask, jsonify, render_template

app = Flask(__name__)
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 3600  # кэш статики на 1 час

# Персональные данные портфолио
NAME = "Ихлосбек"
TELEGRAM = "DarkNightZone"
EMAIL = "ubaydullaevit666ilya@gmail.com"

PROJECTS = [
    {
        "name": "InfaGram",
        "description": "Веб-приложение для общения с друзьями: регистрация, вход, режим управления жестами и ИИ-функции.",
        "tags": ["Python", "HTML", "CSS", "PythonAnywhere"],
        "url": "https://ixlosbekexe.pythonanywhere.com/",
        "action": "Открыть проект",
        "number": "01",
    },
    {
        "name": "Neon Pong Evolution",
        "description": "Неоновый пинг-понг: боты трёх уровней, игра вдвоём, аккаунты, монеты и магазин эффектов для мяча.",
        "tags": ["HTML", "CSS", "JavaScript", "Netlify"],
        "url": "https://ping-pong-aliv.netlify.app/",
        "action": "Играть",
        "number": "02",
    },
    {
        "name": "Laptop Zone",
        "description": "Каталог ноутбуков с фильтрами по цене, бренду и типу, настройкой цветовой темы и неона.",
        "tags": ["HTML", "CSS", "JavaScript", "Netlify"],
        "url": "https://laptop-shop-ultra.netlify.app/",
        "action": "Открыть проект",
        "number": "03",
    },
    {
        "name": "TechnessTeacher",
        "description": "Платформа для изучения Python: курсы и задания, система XP, премиум-видео и админ-панель.",
        "tags": ["HTML", "CSS", "JavaScript", "Netlify"],
        "url": "https://technessteacher.netlify.app/",
        "action": "Открыть проект",
        "number": "04",
    },
    {
        "name": "Saturn Hand Control",
        "description": "Управление 3D-фигурами жестами руки через камеру: Сатурн, куб, сфера и пирамида.",
        "tags": ["JavaScript", "3D", "Распознавание рук", "Netlify"],
        "url": "https://saturn-hand.netlify.app/",
        "action": "Попробовать",
        "number": "05",
    },
]

SKILLS = [
    {"name": "Python", "description": "Логика и серверная разработка", "level": 55},
    {"name": "HTML", "description": "Структура веб-страниц", "level": 50},
    {"name": "CSS", "description": "Дизайн и адаптивная вёрстка", "level": 40},
    {"name": "JavaScript", "description": "Интерактивность интерфейсов", "level": 35},
]

BOOT_LINES = [
    "INITIALIZING IXLOSBEK.PORTFOLIO ...",
    "Подключение модулей Python ........ OK",
    "Загрузка HTML-структуры ........... OK",
    "Компиляция визуальных стилей CSS .. OK",
    "Инициализация анимаций ............ OK",
    f"Поиск проектов .................... FOUND {len(PROJECTS):02d}",
    "Проверка адаптивности ............. OK",
    "Сборка интерфейса ................. COMPLETE",
    "Добро пожаловать. Запускаю сайт...",
]

ROLES = ["Python Developer", "Web Builder", "Flask Enthusiast", "Lifelong Learner"]

STATS = [
    {"value": len(PROJECTS), "label": "проектов онлайн"},
    {"value": len(SKILLS), "label": "технологии в стеке"},
    {"value": 1, "label": "год курсов"},
]

MARQUEE = ["Python", "Flask", "HTML", "CSS", "JavaScript", "Netlify", "PythonAnywhere", "3D", "UI / UX"]


def build_snippet() -> list[str]:
    """Python-код для окна в hero: собирается из реальных данных портфолио."""
    stack = ", ".join(f'"{skill["name"]}"' for skill in SKILLS)
    return [
        "class Developer:",
        f'    name = "{NAME}"',
        f"    stack = [{stack}]",
        f"    projects = {len(PROJECTS)}",
        "",
        "    def mission(self):",
        '        return "build · learn · repeat"',
        "",
        "me = Developer()",
        "print(me.mission())",
    ]


def page_context() -> dict:
    return dict(
        name=NAME,
        telegram=TELEGRAM,
        email=EMAIL,
        projects=PROJECTS,
        skills=SKILLS,
        boot_lines=BOOT_LINES,
        roles=ROLES,
        stats=STATS,
        marquee=MARQUEE,
        snippet=build_snippet(),
    )


@app.route("/")
def home():
    return render_template("index.html", **page_context())


@app.route("/api/projects")
def api_projects():
    """JSON со списком проектов: удобно для проверки и будущих расширений."""
    return jsonify(PROJECTS)

@app.errorhandler(404)
def not_found(_error):
    # Неизвестный адрес показывает главную страницу со статусом 404
    return render_template("index.html", **page_context()), 404


if __name__ == "__main__":
    # Локальный запуск: python app.py
    # Debug включается только так:  FLASK_DEBUG=1 python app.py
    app.run(
        host=os.environ.get("HOST", "127.0.0.1"),
        port=int(os.environ.get("PORT", 5000)),
        debug=os.environ.get("FLASK_DEBUG") == "1",
    )
