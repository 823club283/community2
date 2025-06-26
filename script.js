// 投稿を保存する配列（ローカルストレージを使用）
let posts = [];
try {
    posts = JSON.parse(localStorage.getItem('posts')) || [];
    console.log('投稿をローカルストレージから読み込みました:', posts);
} catch (e) {
    console.error('ローカルストレージの読み込みに失敗しました:', e);
    posts = [];
}

// 公開環境ではローカルストレージが初期化される可能性があるため、デフォルト値を設定
if (posts.length === 0) {
    posts = predefinedPosts.map(content => ({
        username: '初期ユーザー',
        content: content,
        timestamp: new Date().toLocaleString('ja-JP'),
        likes: 0,
        replies: []
    }));
}

let galleryImages = JSON.parse(localStorage.getItem('galleryImages')) || [];
let activeTab = 'latest';
let isAdminLoggedIn = false;

// 事前準備したデータ（`posts.txt`から手動で抽出し、改行で分割）
const predefinedPosts = [
    "風俗行くならワクワクとかハピメでよくねって思う 病気だけは気をつけろよ！",
    "デジカフェで彼氏いるけど退屈って言ってた子を落とした話、\n別に顔でも金でもなくてトークとタイミングだけ。\n出会いって情報戦。動いたやつが勝つ。",
    "ハピメの掲示板にいた女子大生、やたらノリよくて「今から会える？」って聞いたら30分後に来たｗｗｗｗｗ\nそのまま直ホ\n課金＋交通費＋飲み代で5,000円くらい。",
    "先週ハピメで会った看護師の子、めっちゃ聞き上手で会話盛り上がって、終電逃した流れからそのまま\n課金は2,000円くらい、掲示板で1日3通送っただけ。\nまさか1回目でヤれるとは思ってなかったけど、タイミングって大事",
    "ハピメもデジカフェも掲示板→メッセ→アポ\n全部スムーズで使いやすいですね\n私はいいねからのマッチング！みたいな機能は使ってません",
    "ワクメって軽めに遊びたいって温度感の子が多くて\n自然と距離詰めやすいね",
    "昨日会ったJDがずっと誰かと話したかったって言ってて、まじで人懐っこくてかわいかった\nハッピーメールの使い勝手良すぎ抜け出せん笑\nまじで隠れ穴場。",
    "ハピメで事務の子と昼間にランチ→そのままお茶からのホ\n色気あった…。",
    "ハピメ、いい意味で裏切られること多い",
    "デジカフェで若妻お持ち帰りあざす",
    "平日夜、なんとなくハピメ見たら\n「仕事終わりに軽く飲みませんか？」ってOLの投稿あって。\n半信半疑で連絡したら、\n落ち着いてて話も上手いし、こっちの緊張ほぐしてくれた。\nあの余裕は大人の女…また会いたい",
    "看護師さんと会ったけど、気配りとかやばかったｗ\nハピメ、こういう子に会えるからやめられん",
    "デジカフェって聞いたことないアプリ使ったけどおじさんでも出会えましたｗ\n今まで何に時間使ってたんやってなるくらい効率いい笑",
    "恋愛アプリってちょっと疲れるなって思ってた時に、\nデジカフェでふと話した人が、めっちゃ自然体で楽しくて。\nガチじゃなくていいけど、ちょっといい関係って、こういうとこから始まる気がする。",
    "知ってる人だけ得してる感あるけど、\n土曜の夜にハピメの掲示板チェックするだけで予定組めるってマジなんよね。\nノリ軽い子多いし、テンポ感合えばすぐ決まる。\nてか、そろそろまた仕込もかな笑",
    "ハッピーとデジカフェだけじゃもったいない！\nワクメもちょっと人のタイプ違ってて面白い笑\n軽く話してて「今夜ひまなんだよね」って自然に言われること多くてびっくりした",
    "デジカフェ、穴場すぎん？\n会話好きな子多くて、即じゃないけど落とせる感じがリアルでちょうどいい。\nこっちのペースで攻めれるから、慣れてない人にもオススメ。"
].filter(post => post.trim() !== '');

// 画像パスを相対パスに修正
const predefinedImages = [
    "./images/image1.jpg",
    "./images/image2.jpg",
    "./images/image3.jpg"
];

const predefinedThumbnails = [
    "./images/thumbnail1.jpg",
    "./images/thumbnail2.jpg",
    "./images/thumbnail3.jpg"
];

// 広告データとプロモーションテキスト（省略）

// 以下は以前のコードを維持
// URLをリンクに変換する関数
function linkify(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, url => `<a href="${url}" target="_blank">${url}</a>`);
}

// ログイン処理
function login() {
    const password = document.getElementById('admin-password').value;
    if (password === ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('post-form').style.display = 'block';
        alert('ログイン成功！投稿が可能です。');
    } else {
        alert('パスワードが違います！');
    }
}

// タブを切り替える関数
function switchTab(tab) {
    activeTab = tab;
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => button.classList.remove('active'));
    document.querySelector(`.tab-button[onclick="switchTab('${tab}')"]`).classList.add('active');
    displayPosts();
}

// 投稿を表示する関数
function displayPosts() {
    const postsContainer = document.getElementById('posts');
    if (!postsContainer) {
        console.error('投稿コンテナが見つかりません');
        return;
    }
    postsContainer.innerHTML = '';
    let displayPosts = [...posts];

    if (activeTab === 'latest') {
        displayPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else if (activeTab === 'popular') {
        displayPosts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (activeTab === 'media') {
        displayPosts = displayPosts.filter(post => post.image);
    }

    displayPosts.forEach((post, index) => {
        if (index > 0 && (index % 5 === 0)) {
            const adIndex = (index / 5 - 1) % ads.length;
            const randomPromo = promoTexts[Math.floor(Math.random() * promoTexts.length)];
            const adElement = document.createElement('div');
            adElement.className = 'ad-post';
            adElement.setAttribute('data-promo', randomPromo);
            adElement.innerHTML = `
                <div><strong>${ads[adIndex].title}</strong><br>${ads[adIndex].description}<br>
                <a href="${ads[adIndex].link}" target="_blank">詳細</a></div>
            `;
            postsContainer.appendChild(adElement);
        }

        const postIndex = posts.indexOf(post);
        const postElement = document.createElement('div');
        postElement.className = 'post';
        const linkedContent = linkify(post.content);
        postElement.innerHTML = `
            <div class="post-header">
                <span class="username">${post.username || '名無しさん'}</span>
                <span class="timestamp">${post.timestamp}</span>
            </div>
            <div class="post-content">${linkedContent}</div>
            ${post.image ? `<img src="${post.image}" class="post-image" alt="投稿画像">` : ''}
            <div class="post-actions">
                <button onclick="toggleLike(${postIndex})">
                    <span>👍</span> <span>${post.likes || 0}</span>
                </button>
                <button onclick="toggleReplyForm(${postIndex})">
                    <span>💬</span> <span>${post.replies ? post.replies.length : 0}</span>
                </button>
                <button onclick="sharePost(${postIndex})">
                    <span>🔗</span> <span>シェア</span>
                </button>
                <button onclick="toggleEditForm(${postIndex})">
                    <span>✏️</span> <span>編集</span>
                </button>
                <button onclick="deletePost(${postIndex})">
                    <span>🗑️</span> <span>削除</span>
                </button>
            </div>
            <div class="edit-form" id="edit-form-${postIndex}">
                <textarea id="edit-content-${postIndex}">${post.content}</textarea>
                <button onclick="saveEdit(${postIndex})">保存</button>
            </div>
            <div class="reply-form" id="reply-form-${postIndex}">
                <input type="text" id="reply-username-${postIndex}" placeholder="🌟 ユーザー名（任意）">
                <textarea id="reply-content-${postIndex}" placeholder="💬 返信を入力"></textarea>
                <button onclick="submitReply(${postIndex})">💌 返信</button>
            </div>
            <div class="replies" id="replies-${postIndex}">
                ${post.replies ? post.replies.map(reply => `
                    <div class="post">
                        <div class="post-header">
                            <span class="username">${reply.username || '名無しさん'}</span>
                            <span class="timestamp">${reply.timestamp}</span>
                        </div>
                        <div class="post-content">${linkify(reply.content)}</div>
                    </div>
                `).join('') : ''}
            </div>
        `;
        postsContainer.appendChild(postElement);

        if (post.image && !galleryImages.includes(post.image)) {
            galleryImages.push(post.image);
            localStorage.setItem('galleryImages', JSON.stringify(galleryImages));
        }
    });
    postsContainer.classList.add('active');
    displayGallery();
}

// 以下は以前のコードを維持（省略）

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('ページを読み込みました');
    document.getElementById('post-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    switchTab('latest');
    initEmojiPicker();

    // サムネイルをランダムに設定
    const randomThumbnail = predefinedThumbnails[Math.floor(Math.random() * predefinedThumbnails.length)];
    document.getElementById('thumbnail-image').src = randomThumbnail;

    // 自動投稿の開始（15秒ごとに実行）
    setInterval(() => {
        autoPost();
    }, 15000);
});
