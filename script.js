// 投稿を保存する配列（ローカルストレージを使用）
let posts = [];
try {
    posts = JSON.parse(localStorage.getItem('posts')) || [];
    console.log('投稿をローカルストレージから読み込みました:', posts);
} catch (e) {
    console.error('ローカルストレージの読み込みに失敗しました:', e);
    posts = [];
}

let galleryImages = JSON.parse(localStorage.getItem('galleryImages')) || [];
let activeTab = 'latest';
let isAdminLoggedIn = false;

// 事前準備したデータ（`posts.txt`から手動で抽出し、改行で分割）
const predefinedPosts = [
    "💕 今日もマチアプで素敵な出会いがあったよ！",
    "🌸 オフパコ成功！相手が優しくてびっくり！",
    "🎀 ハッピーメールで新しい友達ができた！",
    "⭐ マッチングアプリ、意外と簡単だった！",
    "❤️ 今夜はまたオフ会だよ、楽しみ！"
].filter(post => post.trim() !== ''); // 空行を除外。`posts.txt`の内容をここにコピー

const predefinedImages = [
    "images/image1.jpg",
    "images/image2.jpg",
    "images/image3.jpg"
];

const predefinedThumbnails = [
    "images/thumbnail1.jpg",
    "images/thumbnail2.jpg",
    "images/thumbnail3.jpg"
];

// 広告データとプロモーションテキスト
const ads = [
    {
        title: "ハッピーメール",
        description: "若い子＆学生多め。フレッシュ系狙いに◎",
        link: "https://ngisooap.livedoor.blog/archives/4909543.html"
    },
    {
        title: "ワクワク",
        description: "年齢層は広め。即ヤレ率も高くチャンス多め",
        link: "https://ngisooap.livedoor.blog/archives/3515583.html"
    },
    {
        title: "デジカフェ",
        description: "お姉さん系が多くて積極的。即アポ→即ホの流れもスムーズ",
        link: "https://ngisooap.livedoor.blog/archives/5311653.html"
    }
];
const promoTexts = [
    "💖 今すぐ登録して新しい出会いをゲット！",
    "🌸 あなたも素敵な相手を見つけるチャンス！",
    "🎀 無料登録でワクワクが待ってるよ！",
    "⭐ 今日登録すれば特別な出会いが待ってる！",
    "💕 一緒に楽しい時間を過ごそう、登録は今！"
];

// 絵文字リスト
const emojis = ['😄', '😂', '❤️', '👍', '🎉', '🌸', '💖', '🎀'];
let editingIndex = null;
const MAX_POSTS = 30;
const ADMIN_PASSWORD = "admin123"; // 管理者パスワード（変更可能）

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

// ギャラリーを表示する関数
function displayGallery() {
    const galleryImagesContainer = document.getElementById('gallery-images');
    if (!galleryImagesContainer) {
        console.error('ギャラリーコンテナが見つかりません');
        return;
    }
    galleryImagesContainer.innerHTML = '';
    const uniqueGalleryImages = [...new Set(galleryImages)];
    uniqueGalleryImages.forEach((image, index) => {
        const imgElement = document.createElement('img');
        imgElement.src = image;
        imgElement.className = 'gallery-image';
        imgElement.onclick = () => openModal(image);
        galleryImagesContainer.appendChild(imgElement);
    });
}

// モーダルを開く
function openModal(imageSrc) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `<img src="${imageSrc}" class="modal-content" onclick="this.parentElement.style.display='none'">`;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    modal.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
    };
}

// 絵文字ピッカーを初期化
function initEmojiPicker() {
    const emojiPicker = document.getElementById('emoji-picker');
    if (!emojiPicker) {
        console.error('絵文字ピッカーが見つかりません');
        return;
    }
    emojis.forEach(emoji => {
        const button = document.createElement('button');
        button.innerText = emoji;
        button.onclick = () => addEmoji(emoji);
        emojiPicker.appendChild(button);
    });
}

// 絵文字を追加
function addEmoji(emoji) {
    const textarea = document.getElementById('post-content');
    if (textarea) textarea.value += emoji;
}

// 投稿を追加する関数（管理者専用）
function submitPost() {
    if (!isAdminLoggedIn) {
        alert('ログインが必要です！');
        return;
    }
    console.log('投稿処理を開始します');
    const username = document.getElementById('username')?.value.trim();
    const content = document.getElementById('post-content')?.value.trim();
    const imageInput = document.getElementById('post-image');

    if (!content && !imageInput?.files.length) {
        console.warn('コンテンツまたは画像がありません');
        alert('テキストまたは画像を入力してください');
        return;
    }

    const post = {
        username: username,
        content: content,
        timestamp: new Date().toLocaleString('ja-JP'),
        likes: 0,
        replies: []
    };

    if (imageInput?.files.length > 0) {
        console.log('画像を処理します');
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                post.image = e.target.result;
                posts.push(post);
                if (posts.length > MAX_POSTS) {
                    posts = posts.slice(-MAX_POSTS);
                    galleryImages = galleryImages.slice(-MAX_POSTS);
                }
                localStorage.setItem('posts', JSON.stringify(posts));
                localStorage.setItem('galleryImages', JSON.stringify(galleryImages));
                console.log('投稿を保存しました:', post);
                document.getElementById('username').value = '';
                document.getElementById('post-content').value = '';
                imageInput.value = '';
                displayPosts();
            } catch (e) {
                console.error('投稿の保存に失敗しました:', e);
                alert('投稿に失敗しました。ローカルストレージの容量を確認してください。');
            }
        };
        reader.onerror = function(e) {
            console.error('画像の読み込みに失敗しました:', e);
            alert('画像の読み込みに失敗しました。');
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        try {
            posts.push(post);
            if (posts.length > MAX_POSTS) {
                posts = posts.slice(-MAX_POSTS);
                galleryImages = galleryImages.slice(-MAX_POSTS);
            }
            localStorage.setItem('posts', JSON.stringify(posts));
            localStorage.setItem('galleryImages', JSON.stringify(galleryImages));
            console.log('投稿を保存しました:', post);
            document.getElementById('username').value = '';
            document.getElementById('post-content').value = '';
            if (imageInput) imageInput.value = '';
            displayPosts();
        } catch (e) {
            console.error('投稿の保存に失敗しました:', e);
            alert('投稿に失敗しました。ローカルストレージの容量を確認してください。');
        }
    }
}

// 自動投稿関数
function autoPost() {
    console.log('自動投稿を試行します');
    if (predefinedPosts.length === 0 || predefinedImages.length === 0) {
        console.error('predefinedPostsまたはpredefinedImagesが空です');
        return;
    }
    const randomPost = predefinedPosts[Math.floor(Math.random() * predefinedPosts.length)];
    const randomImage = predefinedImages[Math.floor(Math.random() * predefinedImages.length)];
    const autoPost = {
        username: '秘密の管理人',
        content: randomPost,
        timestamp: new Date().toLocaleString('ja-JP'),
        likes: 0,
        replies: [],
        image: randomImage
    };
    try {
        posts.push(autoPost);
        if (posts.length > MAX_POSTS) {
            posts = posts.slice(-MAX_POSTS);
            galleryImages = galleryImages.slice(-MAX_POSTS);
        }
        localStorage.setItem('posts', JSON.stringify(posts));
        localStorage.setItem('galleryImages', JSON.stringify(galleryImages));
        console.log('自動投稿を保存しました:', autoPost);
        displayPosts();
    } catch (e) {
        console.error('自動投稿の保存に失敗しました:', e);
    }
}

// いいねをトグル
function toggleLike(index) {
    posts[index].likes = (posts[index].likes || 0) + 1;
    try {
        localStorage.setItem('posts', JSON.stringify(posts));
        displayPosts();
    } catch (e) {
        console.error('いいねの保存に失敗しました:', e);
    }
}

// 返信フォームをトグル
function toggleReplyForm(index) {
    const replyForm = document.getElementById(`reply-form-${index}`);
    if (replyForm) replyForm.style.display = replyForm.style.display === 'block' ? 'none' : 'block';
}

// 返信を追加
function submitReply(index) {
    const username = document.getElementById(`reply-username-${index}`)?.value.trim();
    const content = document.getElementById(`reply-content-${index}`)?.value.trim();
    if (!content) {
        alert('返信内容を入力してください');
        return;
    }

    const reply = {
        username: username,
        content: content,
        timestamp: new Date().toLocaleString('ja-JP')
    };

    posts[index].replies = posts[index].replies || [];
    posts[index].replies.push(reply);
    try {
        localStorage.setItem('posts', JSON.stringify(posts));
        if (document.getElementById(`reply-username-${index}`)) document.getElementById(`reply-username-${index}`).value = '';
        if (document.getElementById(`reply-content-${index}`)) document.getElementById(`reply-content-${index}`).value = '';
        displayPosts();
    } catch (e) {
        console.error('返信の保存に失敗しました:', e);
        alert('返信に失敗しました。');
    }
}

// 編集フォームをトグル
function toggleEditForm(index) {
    const editForm = document.getElementById(`edit-form-${index}`);
    if (editForm) editForm.style.display = editForm.style.display === 'block' ? 'none' : 'block';
    editingIndex = index;
}

// 編集を保存
function saveEdit(index) {
    const content = document.getElementById(`edit-content-${index}`)?.value.trim();
    if (content) {
        posts[index].content = content;
        try {
            localStorage.setItem('posts', JSON.stringify(posts));
            if (document.getElementById(`edit-content-${index}`)) document.getElementById(`edit-content-${index}`).value = '';
            displayPosts();
        } catch (e) {
            console.error('編集の保存に失敗しました:', e);
            alert('編集に失敗しました。');
        }
    }
    editingIndex = null;
}

// 投稿をシェア
function sharePost(index) {
    const post = posts[index];
    const shareText = `${post.username || '名無しさん'}: ${post.content} (${post.timestamp})`;
    navigator.clipboard.writeText(shareText).then(() => {
        alert('投稿がクリップボードにコピーされました！');
    });
}

// 投稿を削除
function deletePost(index) {
    if (confirm('この投稿を削除しますか？')) {
        const post = posts[index];
        posts.splice(index, 1);
        if (post.image) {
            galleryImages = galleryImages.filter(img => img !== post.image);
        }
        try {
            localStorage.setItem('posts', JSON.stringify(posts));
            localStorage.setItem('galleryImages', JSON.stringify(galleryImages));
            console.log('投稿を削除しました:', post);
            displayPosts();
        } catch (e) {
            console.error('削除に失敗しました:', e);
            alert('削除に失敗しました。');
        }
    }
}

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

document.getElementById('post-content')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitPost();
    }
});