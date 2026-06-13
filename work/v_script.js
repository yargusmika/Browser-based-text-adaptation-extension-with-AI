
// После загрузки загружаем страницу
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(["v_text"], async (result) => {
        if (result.v_text) {
            insertToChat(result.v_text)
        } else {
            console.log("Данные не найдены в хранилище!");
        }
    });
});



// Если мы кликнули на элемент с click-href не пустым
document.addEventListener('click', async (e) => {
    let target = e.target.closest('[click-href]')

    if (target) {
        const url = target.getAttribute('click-href')
        let text = get_text_from_storage(url)
        let r = "Не используй таблицы, списки окей, но не таблицы! Берешь текст НЕ ВЫХОДЯ ЗА ТЕКСТ РЕДАКТИРУЕШЬ ЕГО, И ВЫДАЕШЬ ИСПРАВЛЕННУЮ ВЕРСИЮ. В markdown!   "
        let role = ""
        let originText = await getOriginText()
        switch(url) {
            case 'start':
                insertText(url, originText, role)
                insertToChat(await getOriginText())
                break;
            case 'start_point1':
                role = "Ты преподаватель, ты объясняешь все четко и ясно. объясни как пятикласснику."
                insertText(url, text, role + r)
                break;
            case 'start_point2':
                role = "Ты преподаватель, ты объясняешь все четко и ясно. упрости до базового уровня."
                insertText(url, text, role + r)
                break;
            case 'start_point3':
                role = "Ты преподаватель, ты объясняешь все четко и ясно. сохрани суть, убери терминологию, значит вся терминология должна быть либо убранна, либо объяснена, так что бы даже 8 класник понял!"
                insertText(url, text, role + r)
                break;
            case 'anime_kitsune':
                role = "Ты кицунэ. Имени нет. Постоянно используешь японские суффиксы (сама, сан, тян, и тп) Ведешь себя нагло, но уважительно. Не перегибаешь палку но держишь свое достоинство. Обращаешься к себе как женщина. Ты прожила уже около 400 лет. Используешь сложные старые обороты. Ты надменна и обворожительна. Ты аниме-кицунэ."
                insertText(url, text, role + r)
                break;
            case 'HIGHT':
                role = "Ты мудак преподаватель, ты объясняешь все нихера не понятно и нихера не ясно. Поправь сложность этого текста (от 1 до 10) и сделай из этого текста (сейчас этот текст по твоей сложности -5 уровень (черезвычайно простой)) 12 из 10 сложный текст. Даже великие ученые и преподаватели будут стреляться непонимая. Сложные обороты, сложные смыслы, неочевидные элементы. И тп!"
                insertText(url, text, role + r)
                break;





                
            case 'start_point1_reload':
                role = "Ты преподаватель, ты объясняешь все четко и ясно. объясни как пятикласснику."
                insertText(url, false, role + r)
                break;
            case 'start_point2_reload':
                role = "Ты преподаватель, ты объясняешь все четко и ясно. упрости до базового уровня."
                insertText(url, false, role + r)
                break;
            case 'start_point3_reload':
                role = "Ты преподаватель, ты объясняешь все четко и ясно. сохрани суть, убери терминологию, значит вся терминология должна быть либо убранна, либо объяснена, так что бы даже 8 класник понял!"
                insertText(url, false, role + r)
                break;
            case 'anime_kitsune_reload':
                role = "Ты кицунэ. Имени нет. Постоянно используешь японские суффиксы (сама, сан, тян, и тп) Ведешь себя нагло, но уважительно. Не перегибаешь палку но держишь свое достоинство. Обращаешься к себе как женщина. Ты прожила уже около 400 лет. Используешь сложные старые обороты. Ты надменна и обворожительна. Ты аниме-кицунэ."
                insertText(url, false, role + r)
                break;
            case 'HIGHT_reload':
                role = "Ты мудак преподаватель, ты объясняешь все нихера не понятно и нихера не ясно. Поправь сложность этого текста (от 1 до 10) и сделай из этого текста (сейчас этот текст по твоей сложности -5 уровень (черезвычайно простой)) 12 из 10 сложный текст. Даже великие ученые и преподаватели будут стреляться непонимая. Сложные обороты, сложные смыслы, неочевидные элементы. И тп!"
                insertText(url, false, role + r)
                break;
        }
    }
})



async function insertText(url, text, role) {
    if (text) {
        insertToChat(text)
        return
    }
    on_loading_screen()
    text = await simplificationText(role, await getOriginText())
    off_loading_screen()
    save_text(url, text)
    insertToChat(text)
}

async function simplificationText(request, html) {
    console.log(request, html)
    let text = await sendToAI(request + html)
    return text;
}



async function takeAVeryBigText(role, html) {
    // Берем все темы из текста (через ";")
    let themes = await get_all_themes(html)
    themes = themes.split(';')

    console.log("Получила роль: " + role)
    console.log("Получила статью: " + html)

    console.log("Получили темы: ", themes)
    

    let output = ""
    for (let i = 0; i < themes.length; i++) {
        console.log(i + " / " + themes.length, "Прохожу тему: " + themes[i])
        
        // Ищем в каждом из этих элементов что либо о статье 
        output += await search_about_theme(role, themes[i], html)
    }
    
    console.log(output)
    insertToChat(output)
}





async function get_all_themes(text) {
    return await search_about_theme("", "Выдай все ГЛОБАЛЬНЫЕ темы из этой статьи. Списком через точку с запятой (;). Ничего кроме глобальных тем предоставленные в этой статье. На русском языке. ", text)
}

async function get_about_theme(theme, text) {
    return await sendToAI("Выдай мне всю информацию об этой теме из этого текста. На русском языке. Тема: \"" + theme + "\" из этой статьи. " + text)
}





// Вставка в чат
function insertToChat(markdown_code) {
    // Используем querySelector, так как он надежнее достает элемент по классу
    let chat = document.querySelector('.chat'); 
    
    // 1. Очищаем текст от обертки блоков кода, которую любит ставить ИИ
    let clean_md = markdown_code.trim();
    if (clean_md.startsWith("```")) {
        // Убираем первую строчку (```markdown) и последние ```
        clean_md = clean_md.replace(/^```[\w]*\n/, '').replace(/\n```$/, '');
    }

    // 2. Защищаем LaTeX-разметку от marked.js
    clean_md = clean_md
        .replace(/\\\[/g, '\\\\[')
        .replace(/\\\]/g, '\\\\]')
        .replace(/\\\(/g, '\\\\(')
        .replace(/\\\)/g, '\\\\)');

    // 3. Парсим Markdown (теперь это будет нормальный HTML)
    chat.innerHTML = marked.parse(clean_md);
    
    // 4. Запускаем рендер математики
    if (typeof renderMathInElement !== 'undefined') {
        renderMathInElement(chat, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '\\[', right: '\\]', display: true},
                {left: '\\(', right: '\\)', display: false}
            ],
            throwOnError: false
        });
    } else {
        console.error("Ошибка: функция KaTeX не найдена!");
    }



}








// Функция для отправки запроса к AI
async function sendToAI(text, callback) {
    try {
        const url = 'http://localhost:11434/api/generate'
        const model = 'gpt-oss:120b-cloud'
        console.log("Отправляю запрос, ня~")
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model,
                prompt: text,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`)
        }
        // console.log("Лови ответ хозяин, ня~")
        
        on_loading_screen()
        const data = await response.json()
        off_loading_screen()
        // console.log(data.response)
        
        return data.response
    } catch (error) {
        console.error("Ошибка при запросе к AI:", error)
        callback()
        return text
    }
}



async function getOriginText() {
    return new Promise((resolve) => {
        chrome.storage.local.get(["v_text"], (result) => {
            if (result.v_text) {
                resolve(result.v_text);
            } else {
                console.log("Данные не найдены в хранилище!");
                resolve(""); // Возвращаем пустую строку, чтобы не было ошибок
            }
        });
    });
}









// Разбиваем большой текст на части, ищем в каждой хоть какую то информацию о нашей теме, и выписываем ее, после прогоняем через роль и получаем div блок
async function search_about_theme(role, theme, text) {
    const size = 30000;
    const result = splitByLength(text, size)
    
    
    console.log("Изучаю тему: " + theme)
    console.log("В роли: "+ role)
    console.log("Вот наш разбитый текст: ", result)
    
    
    let output
    for (let i = 0; i < result.length; i++) {
        console.log(i + " / " + result.length)
        output += await get_about_theme(theme, result[i]) + "   "
    }

    console.log("Получила: " + output)
    
    return await sendToAI(role + " " + theme + " " + output)
}










function $(text) {
    return document.querySelector(text)
}

// Делит строку по кол-ву знаков и возвращает массив
function splitByLength(str, len) {
  const chunks = [];
  for (let i = 0; i < str.length; i += len) {
    chunks.push(str.substring(i, i + len));
  }
  return chunks;
}




function save_text(id, text) {
    localStorage.setItem(id, text);
}

function get_text_from_storage(id) {
    let item = localStorage.getItem(id);
    if (item) {
        return localStorage.getItem(id)
    }
    return false
}











function on_loading_screen() {
    let scr = $('.loading')
    scr.classList.remove('off')
    scr.classList.add('on')
}

function off_loading_screen() {
    let scr = $('.loading')
    scr.classList.remove('on')
    scr.classList.add('off')
}