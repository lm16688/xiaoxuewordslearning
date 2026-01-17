// 生字学习页面JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const gradeTitle = document.getElementById('grade-title');
    const characterElement = document.getElementById('character');
    const pinyinElement = document.getElementById('pinyin');
    const wordGroupsElement = document.getElementById('word-groups');
    const sentenceElement = document.getElementById('sentence');
    const speakBtn = document.getElementById('speak-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const reviewBtn = document.getElementById('review-btn');
    const masteredBtn = document.getElementById('mastered-btn');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const totalCountElement = document.getElementById('total-count');
    const learnedCountElement = document.getElementById('learned-count');
    const reviewCountElement = document.getElementById('review-count');
    const masteredCountElement = document.getElementById('mastered-count');
    const hintText = document.getElementById('hint-text');
    
    // 按钮元素
    const reviewStatsBtn = document.getElementById('review-stats-btn');
    const masteredStatsBtn = document.getElementById('mastered-stats-btn');
    const reviewCountBtn = document.getElementById('review-count-btn');
    const masteredCountBtn = document.getElementById('mastered-count-btn');
    
    // 学习状态变量
    let currentGrade = '';
    let charactersData = [];
    let currentIndex = 0;
    let learnedCharacters = [];
    let reviewCharacters = [];
    let masteredCharacters = [];
    
    // 滑动卡片相关变量
    let currentSliderType = ''; // 'review' 或 'mastered'
    let currentSliderPage = 0;
    const CARDS_PER_PAGE = 4;
    
    // 初始化
   /* async function init() {
        // 从localStorage获取选择的年级
        currentGrade = localStorage.getItem('selectedGrade') || '一年级上册';
        gradeTitle.textContent = currentGrade + ' 生字学习';
        
        // 从JSON文件加载生字数据
        await loadCharactersData();
        
        // 从localStorage加载学习进度
        loadLearningProgress();
        
        // 更新显示
        updateDisplay();
        updateStats();
        
        // 绑定新的事件
        bindNewEvents();
    }*/
    // 初始化
async function init() {
    // 从localStorage获取选择的年级
    currentGrade = localStorage.getItem('selectedGrade') || '一年级上册';
    gradeTitle.textContent = currentGrade + ' 生字学习';
    
    // 检测移动端
    detectMobileDevice();
    
    // 从JSON文件加载生字数据
    await loadCharactersData();
    
    // 从localStorage加载学习进度
    loadLearningProgress();
    
    // 更新显示
    updateDisplay();
    updateStats();
    
    // 绑定新的事件
    bindNewEvents();
}

// 检测移动端设备
function detectMobileDevice() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // 添加移动端特定的样式类
        document.body.classList.add('mobile-device');
        
        // 调整触摸交互
        adjustMobileTouchInteractions();
        
        console.log('移动端设备检测到');
    }
}

// 调整移动端触摸交互
function adjustMobileTouchInteractions() {
    // 为按钮添加触摸反馈
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.opacity = '0.7';
        });
        
        button.addEventListener('touchend', function() {
            this.style.opacity = '1';
        });
    });
    
    // 为生字卡片添加触摸反馈
    const characterCards = document.querySelectorAll('.character-card-item');
    characterCards.forEach(card => {
        card.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        card.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
}
    
    // 加载生字数据
    async function loadCharactersData() {
        try {
            // 从data.json文件加载数据
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`HTTP错误! 状态: ${response.status}`);
            }
            
            const data = await response.json();
            
            // 根据新格式查找对应年级的数据
            const gradeData = data.find(item => item.grade === currentGrade);
            
            if (gradeData && gradeData.characters) {
                // 将数据格式转换为内部使用的格式
                charactersData = gradeData.characters.map(item => ({
                    character: item.word,
                    pinyin: item.pinyin,
                    wordGroups: item.words,
                    sentence: item.sentence
                }));
            } else {
                console.warn(`年级"${currentGrade}"没有找到数据，使用演示数据`);
                // 如果没有找到对应年级的数据，使用演示数据作为后备
                charactersData = getDemoData();
            }
            
        } catch (error) {
            console.error('加载数据失败:', error);
            // 使用演示数据作为后备
            charactersData = getDemoData();
        }
    }
    
    // 获取演示数据（作为后备）
    function getDemoData() {
        return [
            {character: "天", pinyin: "tiān", wordGroups: ["天空", "今天"], sentence: "蓝蓝的天空像大海。"},
            {character: "地", pinyin: "dì", wordGroups: ["大地", "土地"], sentence: "大地妈妈真温暖。"},
            {character: "人", pinyin: "rén", wordGroups: ["人们", "好人"], sentence: "人们都在努力工作。"},
            {character: "你", pinyin: "nǐ", wordGroups: ["你好", "你们"], sentence: "你们好，新同学！"},
            {character: "我", pinyin: "wǒ", wordGroups: ["我们", "自我"], sentence: "我们是一年级学生。"}
        ];
    }
    
    // 加载学习进度
    function loadLearningProgress() {
        const savedProgress = localStorage.getItem(`learningProgress_${currentGrade}`);
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            learnedCharacters = progress.learned || [];
            reviewCharacters = progress.review || [];
            masteredCharacters = progress.mastered || [];
        } else {
            // 初始状态：所有生字都未学习
            learnedCharacters = [];
            reviewCharacters = [];
            masteredCharacters = [];
        }
    }
    
    // 保存学习进度
    function saveLearningProgress() {
        const progress = {
            learned: learnedCharacters,
            review: reviewCharacters,
            mastered: masteredCharacters,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(`learningProgress_${currentGrade}`, JSON.stringify(progress));
        
        // 更新统计按钮上的数字
        updateStatsButtons();
    }
    
    // 更新显示当前生字
    function updateDisplay() {
        if (charactersData.length === 0) {
            characterElement.textContent = "无";
            pinyinElement.textContent = "";
            wordGroupsElement.innerHTML = "";
            sentenceElement.textContent = "暂无数据";
            return;
        }
        
        const currentChar = charactersData[currentIndex];
        
        // 更新生字信息
        characterElement.textContent = currentChar.character;
        pinyinElement.textContent = currentChar.pinyin;
        
        // 更新组词
        wordGroupsElement.innerHTML = "";
        currentChar.wordGroups.forEach(word => {
            const span = document.createElement('span');
            span.className = 'word-group';
            span.textContent = word;
            wordGroupsElement.appendChild(span);
        });
        
        // 更新例句
        sentenceElement.textContent = currentChar.sentence;
        
        // 更新进度条
        const progressPercent = ((currentIndex + 1) / charactersData.length) * 100;
        progressFill.style.width = `${progressPercent}%`;
        progressText.textContent = `${currentIndex + 1}/${charactersData.length}`;
        
        // 更新按钮状态
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === charactersData.length - 1;
        
        // 更新艾宾浩斯提示
        updateHint();
        
        // 如果滑动卡片显示中，更新激活状态
        const sliderContainer = document.getElementById('characters-slider-container');
        if (sliderContainer && sliderContainer.style.display !== 'none') {
            updateSliderDisplay();
        }
    }
    
    // 更新学习统计
    function updateStats() {
        totalCountElement.textContent = charactersData.length;
        learnedCountElement.textContent = learnedCharacters.length;
        reviewCountElement.textContent = reviewCharacters.length;
        masteredCountElement.textContent = masteredCharacters.length;
        
        // 同时更新统计按钮上的数字
        updateStatsButtons();
    }
    
    // 更新统计按钮上的数字
    function updateStatsButtons() {
        reviewCountBtn.textContent = reviewCharacters.length;
        masteredCountBtn.textContent = masteredCharacters.length;
    }
    
    // 更新艾宾浩斯提示
    function updateHint() {
        const currentChar = charactersData[currentIndex];
        const char = currentChar.character;
        
        // 检查当前生字的学习状态
        if (masteredCharacters.includes(char)) {
            hintText.textContent = "恭喜！这个生字您已经标记为完全掌握。根据艾宾浩斯记忆法，建议31天后进行一次最终复习以巩固长期记忆。";
        } else if (reviewCharacters.includes(char)) {
            hintText.textContent = "这个生字您标记为需要复习。根据艾宾浩斯记忆法，建议在1小时后、9小时后和1天后分别进行复习。";
        } else if (learnedCharacters.includes(char)) {
            hintText.textContent = "这个生字您已经学习过。根据艾宾浩斯记忆法，建议在20分钟后进行一次复习以巩固记忆。";
        } else {
            hintText.textContent = "这是您第一次学习这个生字。根据艾宾浩斯记忆法，请在20分钟后复习一次，然后按照计划进行后续复习。";
        }
    }
    
    // 绑定新的事件
    function bindNewEvents() {
        // 查看需复习按钮
        reviewStatsBtn.addEventListener('click', function() {
            showCharactersSlider('review', '需复习的生字');
        });
        
        // 查看已掌握按钮
        masteredStatsBtn.addEventListener('click', function() {
            showCharactersSlider('mastered', '已掌握的生字');
        });
        
        // 关闭滑动卡片
        const closeSliderBtn = document.getElementById('close-slider-btn');
        closeSliderBtn.addEventListener('click', closeCharactersSlider);
        
        // 滑动控制按钮
        const sliderPrevBtn = document.getElementById('slider-prev-btn');
        const sliderNextBtn = document.getElementById('slider-next-btn');
        
        sliderPrevBtn.addEventListener('click', function() {
            if (currentSliderPage > 0) {
                currentSliderPage--;
                updateSliderDisplay();
            }
        });
        
        sliderNextBtn.addEventListener('click', function() {
            const characters = getCurrentSliderCharacters();
            const totalPages = Math.ceil(characters.length / CARDS_PER_PAGE);
            if (currentSliderPage < totalPages - 1) {
                currentSliderPage++;
                updateSliderDisplay();
            }
        });
        
        // 按下ESC键关闭滑动卡片
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeCharactersSlider();
            }
        });
    }
    
    // 获取当前滑动卡片类型的生字列表
    function getCurrentSliderCharacters() {
        if (currentSliderType === 'review') {
            return reviewCharacters;
        } else if (currentSliderType === 'mastered') {
            return masteredCharacters;
        }
        return [];
    }
    
    // 显示生字滑动卡片
    function showCharactersSlider(type, title) {
        const sliderContainer = document.getElementById('characters-slider-container');
        const sliderTitle = document.getElementById('slider-title');
        
        currentSliderType = type;
        currentSliderPage = 0;
        sliderTitle.textContent = title;
        
        // 更新滑动卡片内容
        updateSliderDisplay();
        
        // 显示滑动容器
        sliderContainer.style.display = 'block';
        
        // 滚动到滑动卡片区域
        sliderContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // 更新滑动卡片显示
    function updateSliderDisplay() {
        const characters = getCurrentSliderCharacters();
        const charactersSlider = document.getElementById('characters-slider');
        const sliderEmpty = document.getElementById('slider-empty');
        const sliderDots = document.getElementById('slider-dots');
        const sliderPrevBtn = document.getElementById('slider-prev-btn');
        const sliderNextBtn = document.getElementById('slider-next-btn');
        
        // 清空内容
        charactersSlider.innerHTML = '';
        sliderDots.innerHTML = '';
        
        if (characters.length === 0) {
            // 显示空状态
            sliderEmpty.style.display = 'block';
            sliderPrevBtn.disabled = true;
            sliderNextBtn.disabled = true;
            return;
        }
        
        sliderEmpty.style.display = 'none';
        
        // 计算分页
        const totalPages = Math.ceil(characters.length / CARDS_PER_PAGE);
        const startIndex = currentSliderPage * CARDS_PER_PAGE;
        const endIndex = Math.min(startIndex + CARDS_PER_PAGE, characters.length);
        const currentPageCharacters = characters.slice(startIndex, endIndex);
        
        // 显示当前页的生字卡片
        currentPageCharacters.forEach(char => {
            // 找到生字的完整信息
            const charInfo = charactersData.find(item => item.character === char);
            if (charInfo) {
                const isActive = currentIndex !== -1 && charactersData[currentIndex].character === char;
                
                const charCard = document.createElement('div');
                charCard.className = `character-card-item ${isActive ? 'active' : ''}`;
                charCard.innerHTML = `
                    <div class="card-character">${charInfo.character}</div>
                    <div class="card-pinyin">${charInfo.pinyin}</div>
                    <div class="card-status ${reviewCharacters.includes(char) ? 'status-review' : ''} ${masteredCharacters.includes(char) ? 'status-mastered' : ''}">
                        ${reviewCharacters.includes(char) ? '需复习' : masteredCharacters.includes(char) ? '已掌握' : '已学习'}
                    </div>
                `;
                
                // 点击生字卡片，跳转到该生字学习
                charCard.addEventListener('click', function() {
                    const index = charactersData.findIndex(item => item.character === char);
                    if (index !== -1) {
                        currentIndex = index;
                        updateDisplay();
                    }
                });
                
                charactersSlider.appendChild(charCard);
            }
        });
        
        // 更新分页点
        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('div');
            dot.className = `slider-dot ${i === currentSliderPage ? 'active' : ''}`;
            dot.addEventListener('click', function() {
                currentSliderPage = i;
                updateSliderDisplay();
            });
            sliderDots.appendChild(dot);
        }
        
        // 更新控制按钮状态
        sliderPrevBtn.disabled = currentSliderPage === 0;
        sliderNextBtn.disabled = currentSliderPage >= totalPages - 1;
    }
    
    // 关闭滑动卡片
    function closeCharactersSlider() {
        const sliderContainer = document.getElementById('characters-slider-container');
        sliderContainer.style.display = 'none';
    }
    
    // 语音朗读
  /*  function speakText(text) {
        if ('speechSynthesis' in window) {
            // 停止任何正在进行的朗读
            speechSynthesis.cancel();
            
            // 创建语音实例
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.8; // 稍慢的语速
            
            // 开始朗读
            speechSynthesis.speak(utterance);
        } else {
            // 不再弹出alert，静默处理
            console.log('您的浏览器不支持语音朗读功能');
        }
    }*/
    // 语音朗读 - 增强移动端兼容性
function speakText(text) {
    if ('speechSynthesis' in window) {
        // 停止任何正在进行的朗读
        speechSynthesis.cancel();
        
        // 创建语音实例
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.8; // 稍慢的语速
        
        // 移动端特殊处理
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            // 移动端设备
            console.log('移动端设备，尝试语音朗读');
            
            // 尝试在用户交互后立即播放
            utterance.onstart = function() {
                console.log('语音开始播放');
            };
            
            utterance.onerror = function(event) {
                console.error('语音播放错误:', event.error);
                if (event.error === 'interrupted') {
                    // 用户中断，可能是浏览器策略限制
                    showMobileSpeechHint();
                }
            };
            
            // 延迟一点开始，确保在用户交互上下文中
            setTimeout(() => {
                speechSynthesis.speak(utterance);
            }, 100);
        } else {
            // 桌面端正常播放
            speechSynthesis.speak(utterance);
        }
    } else {
        // 浏览器不支持语音合成
        console.log('您的浏览器不支持语音朗读功能');
        showUnsupportedBrowserMessage();
    }
}

// 显示移动端语音提示
function showMobileSpeechHint() {
    // 检查是否已经显示过提示
    if (localStorage.getItem('speechHintShown')) {
        return;
    }
    
    // 创建提示框
    const hintBox = document.createElement('div');
    hintBox.className = 'mobile-speech-hint';
    hintBox.innerHTML = `
        <div class="hint-content">
            <h4><i class="fas fa-volume-up"></i> 语音朗读提示</h4>
            <p>在部分手机浏览器中，语音朗读功能可能需要：</p>
            <ul>
                <li>确保手机音量已开启</li>
                <li>某些浏览器需要允许"自动播放"权限</li>
                <li>如果无法朗读，请尝试切换到Chrome或Safari浏览器</li>
            </ul>
            <button class="hint-close-btn">知道了</button>
        </div>
    `;
    
    // 样式
    hintBox.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        padding: 20px;
    `;
    
    const hintContent = hintBox.querySelector('.hint-content');
    hintContent.style.cssText = `
        background-color: white;
        border-radius: 12px;
        padding: 20px;
        max-width: 400px;
        width: 100%;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
    `;
    
    hintBox.querySelector('h4').style.cssText = `
        color: #4a6fa5;
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    hintBox.querySelector('ul').style.cssText = `
        padding-left: 20px;
        margin: 10px 0;
    `;
    
    hintBox.querySelector('li').style.marginBottom = '5px';
    
    const closeBtn = hintBox.querySelector('.hint-close-btn');
    closeBtn.style.cssText = `
        background-color: #4a6fa5;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 10px 20px;
        font-size: 14px;
        cursor: pointer;
        margin-top: 15px;
        width: 100%;
    `;
    
    // 关闭按钮事件
    closeBtn.addEventListener('click', function() {
        document.body.removeChild(hintBox);
        localStorage.setItem('speechHintShown', 'true');
    });
    
    // 添加到页面
    document.body.appendChild(hintBox);
    
    // 5秒后自动关闭
    setTimeout(() => {
        if (document.body.contains(hintBox)) {
            document.body.removeChild(hintBox);
            localStorage.setItem('speechHintShown', 'true');
        }
    }, 5000);
}

// 显示浏览器不支持的消息
function showUnsupportedBrowserMessage() {
    const messageBox = document.createElement('div');
    messageBox.className = 'unsupported-browser-message';
    messageBox.innerHTML = `
        <div class="message-content">
            <p><i class="fas fa-exclamation-triangle"></i> 您的浏览器不支持语音朗读功能</p>
            <p>建议使用最新版的Chrome、Edge或Safari浏览器</p>
        </div>
    `;
    
    messageBox.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #f39c12;
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        z-index: 9998;
        max-width: 90%;
        text-align: center;
        animation: slideUp 0.3s ease;
    `;
    
    // 动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from { bottom: -100px; }
            to { bottom: 20px; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(messageBox);
    
    // 5秒后自动消失
    setTimeout(() => {
        if (document.body.contains(messageBox)) {
            messageBox.style.animation = 'slideDown 0.3s ease';
            const slideDownStyle = document.createElement('style');
            slideDownStyle.textContent = `
                @keyframes slideDown {
                    from { bottom: 20px; }
                    to { bottom: -100px; }
                }
            `;
            document.head.appendChild(slideDownStyle);
            
            setTimeout(() => {
                if (document.body.contains(messageBox)) {
                    document.body.removeChild(messageBox);
                }
            }, 300);
        }
    }, 5000);
}
    
    // 事件监听器
   /* speakBtn.addEventListener('click', function() {
        const currentChar = charactersData[currentIndex];
        // 朗读生字
        speakText(currentChar.character);
        
        // 添加到已学习列表（如果还未学习）
        if (!learnedCharacters.includes(currentChar.character)) {
            learnedCharacters.push(currentChar.character);
            saveLearningProgress();
            updateStats();
            updateHint();
        }
    });*/
    speakBtn.addEventListener('click', function() {
    const currentChar = charactersData[currentIndex];
    
    // 移动端特殊处理：显示加载状态
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        const originalHtml = speakBtn.innerHTML;
        speakBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 加载中...';
        speakBtn.disabled = true;
        
        // 朗读生字
        speakText(currentChar.character);
        
        // 恢复按钮状态
        setTimeout(() => {
            speakBtn.innerHTML = originalHtml;
            speakBtn.disabled = false;
        }, 1000);
    } else {
        // 桌面端正常处理
        speakText(currentChar.character);
    }
    
    // 添加到已学习列表（如果还未学习）
    if (!learnedCharacters.includes(currentChar.character)) {
        learnedCharacters.push(currentChar.character);
        saveLearningProgress();
        updateStats();
        updateHint();
    }
});
    
    prevBtn.addEventListener('click', function() {
        if (currentIndex > 0) {
            currentIndex--;
            updateDisplay();
        }
    });
    
    nextBtn.addEventListener('click', function() {
        if (currentIndex < charactersData.length - 1) {
            currentIndex++;
            updateDisplay();
        }
    });
    
    reviewBtn.addEventListener('click', function() {
        const currentChar = charactersData[currentIndex];
        const char = currentChar.character;
        
        // 添加到复习列表
        if (!reviewCharacters.includes(char)) {
            reviewCharacters.push(char);
        }
        
        // 从已掌握列表中移除（如果存在）
        const masteredIndex = masteredCharacters.indexOf(char);
        if (masteredIndex !== -1) {
            masteredCharacters.splice(masteredIndex, 1);
        }
        
        // 保存进度
        saveLearningProgress();
        updateStats();
        updateHint();
        
        // 不再弹出alert，改为在按钮上显示反馈
        const originalText = reviewBtn.innerHTML;
        reviewBtn.innerHTML = '<i class="fas fa-check"></i> 已标记';
        reviewBtn.style.backgroundColor = '#27ae60';
        
        setTimeout(() => {
            reviewBtn.innerHTML = originalText;
            reviewBtn.style.backgroundColor = '';
        }, 1500);
    });
    
    masteredBtn.addEventListener('click', function() {
        const currentChar = charactersData[currentIndex];
        const char = currentChar.character;
        
        // 添加到已掌握列表
        if (!masteredCharacters.includes(char)) {
            masteredCharacters.push(char);
        }
        
        // 从复习列表中移除（如果存在）
        const reviewIndex = reviewCharacters.indexOf(char);
        if (reviewIndex !== -1) {
            reviewCharacters.splice(reviewIndex, 1);
        }
        
        // 确保在已学习列表中
        if (!learnedCharacters.includes(char)) {
            learnedCharacters.push(char);
        }
        
        // 保存进度
        saveLearningProgress();
        updateStats();
        updateHint();
        
        // 不再弹出alert，改为在按钮上显示反馈
        const originalText = masteredBtn.innerHTML;
        masteredBtn.innerHTML = '<i class="fas fa-check"></i> 已掌握';
        masteredBtn.style.backgroundColor = '#4a6fa5';
        
        setTimeout(() => {
            masteredBtn.innerHTML = originalText;
            masteredBtn.style.backgroundColor = '';
        }, 1500);
    });
    
    // 初始化应用
    init();
});
