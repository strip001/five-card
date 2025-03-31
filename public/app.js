function formatCards(result) {
    // 将结果按换行符分割成数组
    const cards = result.split('\n').filter(card => card.trim());
    
    // 生成HTML
    return cards.map(card => `
        <div class="card" onclick="generateCard()">
            <div class="card-content">
                ${card}
            </div>
        </div>
    `).join('');
}

async function generateCard() {
    const keyword = document.getElementById('keyword').value.trim();
    const apiKey = document.getElementById('apiKey').value.trim();
    
    if (!keyword) {
        alert('请输入知识点！');
        return;
    }
    
    if (!apiKey) {
        alert('请输入 API Key！');
        return;
    }

    const loading = document.getElementById('loading');
    const cardsDiv = document.getElementById('cards');
    
    loading.style.display = 'block';
    cardsDiv.innerHTML = '';

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ keyword, apiKey })
        });

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }

        document.getElementById('cards').innerHTML = formatCards(data.result);
    } catch (error) {
        alert('生成失败：' + error.message);
    } finally {
        loading.style.display = 'none';
    }
}

function renderCards(content) {
    const cards = content.split('\n')
        .filter(line => line.trim())
        .map(line => {
            const [emoji, ...text] = line.split(' ');
            return `
                <div class="card" onclick="regenerateCard('${emoji}')">
                    <span class="emoji">${emoji}</span>
                    ${text.join(' ')}
                </div>
            `;
        });

    document.getElementById('cards').innerHTML = cards.join('');
}

async function regenerateCard(emoji) {
    const keyword = document.getElementById('keyword').value;
    const newEmoji = prompt('输入新的Emoji', emoji);
    if (newEmoji) {
        const cardText = prompt('输入新的记忆点');
        if (cardText) {
            await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    keyword: keyword,
                    custom: `${newEmoji} ${cardText}`,
                    apiKey: apiKey
                })
            });
            generateCard();
        }
    }
}

// 回车键触发
document.getElementById('keyword').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') generateCard();
});