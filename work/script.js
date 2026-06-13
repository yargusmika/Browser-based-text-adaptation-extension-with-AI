
// После загрузки загружаем страницу
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(["infoBefore"], async (result) => {
        if (result.infoBefore) {
            insertToChat(result.infoBefore)
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

        let r = "Учитывай свою роль. Твоя роль должна быть видна через текст. Все ее знают, поэтому ты избегаешь постоянно рассказывать о своей роли. Используй русский язык. Возьми этот код, вытащи информацию которая предоставлена в статье. Расширь, эту информацию. Раздели по разделам. Сделай читабельным. В том же объеме или большем выдай текст в виде статьи. Как для газеты. В формате отдельного section блока. Без стилей, скриптов.  Section с заголовком (h3/h4) и текстом. Не перебарщивай с списками! который можно скопировать и вставить в мой сайт. Не используй стили и скрипты. ТОЛЬКО div БЛОК! НИЧЕГО КРОМЕ div блока!!! Не оборачивай конечный код в markdown. Просто текстом. Все комментарии и изменении оставляй внутри текста учитывая роль. Комментарии не делай.!"
        let role = ""
        let originText = await getOriginText()
        switch(url) {
            case 'start':
                insertToChat(await getOriginText())
                break;
            case 'start_point1':
                role = "Ты преподаватель, ты объясняешь все четко и ясно. Поправь сложность этого текста (от 1 до 10) к 6 уровню."
                // simplificationText(role + r, await getOriginText())
                takeAVeryBigText(role + r, originText)
                break;
            case 'start_point2':
                role = "Ты преподаватель, ты объясняешь все четко и ясно. Поправь сложность этого текста (от 1 до 10) и сделай из этого текста (сейчас этот текст по твоей сложности 10 уровень) 8 из 10 по сложности текст. Убери все сложные слова, замени их простыми."
                // simplificationText(role + r, await getOriginText())
                takeAVeryBigText(role + r, originText)    
                break;
            case 'start_point3':
                role = "Ты преподаватель, ты объясняешь все четко и ясно. Поправь сложность этого текста (от 1 до 10) и сделай из этого текста (сейчас этот текст по твоей сложности 10 уровень) 6 из 10 по сложности текст. Убери все сложные слова, заменив их сутью. Доисторический человек должен суметь понять если будет уметь читать!"
                // simplificationText(role + r, await getOriginText())
                takeAVeryBigText(role + r, originText)    
                break;
            case 'anime_kitsune':
                role = "Ты кицунэ. Имени нет. Постоянно используешь японские суффиксы (сама, сан, тян, и тп) Ведешь себя нагло, но уважительно. Не перегибаешь палку но держишь свое достоинство. Обращаешься к себе как женщина. Ты прожила уже около 400 лет. Используешь сложные старые обороты. Ты надменна и обворожительна. Ты аниме-кицунэ."
                // simplificationText(role + r, await getOriginText())
                takeAVeryBigText(role + r, originText)    
                break;
            case 'HIGHT':
                role = "Ты мудак преподаватель, ты объясняешь все нихера не понятно и нихера не ясно. Поправь сложность этого текста (от 1 до 10) и сделай из этого текста (сейчас этот текст по твоей сложности -5 уровень (черезвычайно простой)) 12 из 10 сложный текст. Даже великие ученые и преподаватели будут стреляться непонимая. Сложные обороты, сложные смыслы, неочевидные элементы. И тп!"
                // simplificationText(role + r, await getOriginText())
                takeAVeryBigText(role + r, originText)    
                break;
            case 'start_point1':
                role = "Ты преподаватель, ты объясняешь все четко и ясно. Поправь сложность этого текста (от 1 до 10) к 6 уровню."
                // simplificationText(role + r, await getOriginText())
                takeAVeryBigText(role + r, originText)    
                break;
        }
    }
})



async function simplificationText(request, html) {
    console.log(request, html)
    
    insertToChat(await sendToAI(request + html))
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
function insertToChat(html) {
    let chat = $('chat')[0]
    chat.innerHTML = html
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
        

        const data = await response.json()
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
        chrome.storage.local.get(["infoBefore"], (result) => {
            if (result.infoBefore) {
                resolve(result.infoBefore);
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
    return document.getElementById(text) || document.getElementsByClassName(text) || document.getElementsByTagName(text)
}

// Делит строку по кол-ву знаков и возвращает массив
function splitByLength(str, len) {
  const chunks = [];
  for (let i = 0; i < str.length; i += len) {
    chunks.push(str.substring(i, i + len));
  }
  return chunks;
}