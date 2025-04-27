// 游戏主逻辑
document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const background = document.getElementById('background');
    const catsContainer = document.getElementById('cats-container');
    const catNameElement = document.getElementById('cat-name');
    const foundCountElement = document.getElementById('found-count');
    const totalCountElement = document.getElementById('total-count');
    const winMessage = document.getElementById('win-message');
    const restartButton = document.getElementById('restart-button');
    const debugToggle = document.getElementById('debug-toggle');
    const savePositionsButton = document.getElementById('save-positions');
    const coordinatesDisplay = document.getElementById('coordinates-display');
    const startGameButton = document.getElementById('start-game-button');
    
    // 游戏状态
    let gameContainer = document.querySelector('.game-container');
    let isDebugMode = false;
    let draggedCat = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let backgroundRect = null;
    let scale = 1;
    let bestTime = localStorage.getItem('bestTime') || null;
    let gameStartTime = null;
    let gameTimer = null;
    let isGameActive = false; // 游戏是否激活状态
    
    // 音效
    const meowSound = new Audio('./sounds/meow.mp3');
    
    // 初始化烟花效果
    const fireworks = new FireworksDisplay('fireworks-container');
    
    // 初始化游戏
    function initGame() {
        // 更新总猫咪数量显示
        totalCountElement.textContent = catsData.length;
        
        // 重置猫咪状态
        catsData.forEach(cat => {
            cat.found = false;
        });
        
        // 清空猫咪容器
        catsContainer.innerHTML = '';
        
        // 创建猫咪元素
        createCats();
        
        // 更新计数器
        updateCounter();
        
        // 隐藏胜利消息
        winMessage.classList.remove('show');
        
        // 停止烟花效果
        fireworks.stop();
        
        // 开始计时
        gameStartTime = Date.now();
        if (gameTimer) clearInterval(gameTimer);
        gameTimer = setInterval(updateGameTime, 1000);
    }
    
    // 创建猫咪元素
    function createCats() {
        // 跟踪需要加载的图片数量
        let imagesLoaded = 0;
        const totalImages = catsData.length;
        
        catsData.forEach(cat => {
            const catElement = document.createElement('img');
            catElement.className = 'cat';
            catElement.dataset.id = cat.id;
            catElement.alt = cat.name;
            
            // 如果猫咪已经被找到，添加found类
            if (cat.found) {
                catElement.classList.add('found');
            }
            
            // 监听图片加载完成事件
            catElement.onload = function() {
                imagesLoaded++;
                
                // 当所有图片都加载完成后，更新所有猫咪位置
                if (imagesLoaded === totalImages) {
                    updateAllCatsPositions();
                    // 为所有猫咪添加点击事件
                    addCatClickEvents();
                }
            };
            
            // 设置图片源（放在onload事件设置后，确保事件能被触发）
            catElement.src = cat.image;
            
            // 添加到容器
            catsContainer.appendChild(catElement);
        });
    }
    
    // 更新猫咪位置
    function updateCatPosition(catElement, cat) {
        // 确保背景图已加载
        if (!background.complete) {
            // 如果背景图未加载完成，等待加载完成后再更新位置
            background.onload = function() {
                updateCatPosition(catElement, cat);
            };
            return;
        }
        
        // 确保猫咪图片已加载
        if (!catElement.complete) {
            // 如果猫咪图片未加载完成，等待加载完成后再更新位置
            catElement.onload = function() {
                updateCatPosition(catElement, cat);
            };
            return;
        }
        
        backgroundRect = background.getBoundingClientRect();
        
        // 计算背景图的缩放比例
        const bgScale = backgroundRect.width / background.naturalWidth;
        // 为所有猫咪应用统一的缩放比例，但保持原始宽高比
        const scaleValue = isDebugMode ? bgScale : bgScale * 1.5;
        
        // 计算猫咪位置，考虑到transform的translate偏移
        const x = backgroundRect.left + (cat.x * backgroundRect.width);
        const y = backgroundRect.top + (cat.y * backgroundRect.height);
        
        catElement.style.left = `${x}px`;
        catElement.style.top = `${y}px`;
        
        // 使用transform进行缩放，但不改变宽高比
        // 在调试模式下，确保猫咪可以准确定位到背景图的任何位置，包括边缘区域
        catElement.style.transform = `translate(-50%, -50%) scale(${scaleValue})`;
    }
    
    // 更新所有猫咪位置
    function updateAllCatsPositions() {
        const cats = document.querySelectorAll('.cat');
        cats.forEach(catElement => {
            const catId = parseInt(catElement.dataset.id);
            const cat = catsData.find(c => c.id === catId);
            if (cat) {
                updateCatPosition(catElement, cat);
            }
        });
    }
    
    // 更新计数器
    function updateCounter() {
        const foundCount = catsData.filter(cat => cat.found).length;
        foundCountElement.textContent = foundCount;
        
        // 检查是否找到所有猫咪
        if (foundCount === catsData.length) {
            gameWin();
        }
    }
    
    // 更新游戏时间
    function updateGameTime() {
        if (!gameStartTime) return;
        
        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - gameStartTime) / 1000);
        
        // 可以在这里添加时间显示元素
        // timeElement.textContent = formatTime(elapsedSeconds);
    }
    
    // 格式化时间
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // 显示猫咪名字
    function showCatName(cat, x, y) {
        catNameElement.textContent = cat.name;
        catNameElement.style.left = `${x}px`;
        catNameElement.style.top = `${y - 30}px`;
        catNameElement.classList.add('show');
        
        // 3秒后隐藏名字
        setTimeout(() => {
            catNameElement.classList.remove('show');
        }, 3000);
    }
    
    // 找到猫咪
    function findCat(cat, x, y) {
        if (cat.found) return;
        
        // 标记为已找到
        cat.found = true;
        
        // 显示猫咪
        const catElement = document.querySelector(`.cat[data-id="${cat.id}"]`);
        if (catElement) {
            catElement.classList.add('found');
        }
        
        // 显示猫咪名字
        showCatName(cat, x, y);
        
        // 播放音效
        meowSound.currentTime = 0;
        meowSound.play().catch(e => console.log('音频播放失败:', e));
        
        // 更新计数器
        updateCounter();
    }
    
    // 游戏胜利
    function gameWin() {
        // 停止计时
        if (gameTimer) clearInterval(gameTimer);
        
        // 计算游戏时间
        const gameTime = Math.floor((Date.now() - gameStartTime) / 1000);
        
        // 更新最佳时间
        if (!bestTime || gameTime < bestTime) {
            bestTime = gameTime;
            localStorage.setItem('bestTime', bestTime);
        }
        
        // 显示胜利消息
        winMessage.classList.add('show');
        
        // 播放烟花效果
        fireworks.start();
    }
    
    // 点击背景检测猫咪
    background.addEventListener('click', (e) => {
        if (isDebugMode || !isGameActive) return;
        
        const rect = background.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        // 计算点击位置相对于背景图的比例
        const relativeX = clickX / rect.width;
        const relativeY = clickY / rect.height;
        
        // 检测是否点击到猫咪
        catsData.forEach(cat => {
            // 计算猫咪位置
            const catX = cat.x * rect.width;
            const catY = cat.y * rect.height;
            
            // 计算点击位置与猫咪位置的距离
            const distance = Math.sqrt(
                Math.pow(clickX - catX, 2) + 
                Math.pow(clickY - catY, 2)
            );
            
            // 增加检测范围到40像素，提高点击精度
            if (distance <= 40) {
                findCat(cat, e.clientX, e.clientY);
            }
        });
    });
    
    // 为猫咪元素添加点击事件
    function addCatClickEvents() {
        const cats = document.querySelectorAll('.cat');
        cats.forEach(catElement => {
            catElement.addEventListener('click', (e) => {
                e.preventDefault(); // 阻止默认行为
                e.stopPropagation(); // 阻止事件冒泡
                
                if (isDebugMode || !isGameActive) return;
                
                const catId = parseInt(catElement.dataset.id);
                const cat = catsData.find(c => c.id === catId);
                
                if (cat && !cat.found) {
                    findCat(cat, e.clientX, e.clientY);
                }
            });
        });
    }
    
    // 重新开始游戏
    restartButton.addEventListener('click', () => {
        initGame();
        // 确保重新开始游戏后也添加猫咪点击事件
        setTimeout(addCatClickEvents, 500); // 延迟一点时间确保猫咪元素已创建
    });
    
    // 调试模式切换
    debugToggle.addEventListener('click', () => {
        isDebugMode = !isDebugMode;
        gameContainer.classList.toggle('debug-mode', isDebugMode);
        savePositionsButton.classList.toggle('hidden', !isDebugMode);
        coordinatesDisplay.classList.toggle('hidden', !isDebugMode);
        
        if (isDebugMode) {
            debugToggle.textContent = '关闭调试模式';
            enableDragMode();
        } else {
            debugToggle.textContent = '调试模式';
            disableDragMode();
        }
    });
    
    // 保存猫咪位置
    savePositionsButton.addEventListener('click', () => {
        saveCatsPositions();
        alert('猫咪位置已保存！');
    });
    
    // 启用拖动模式
    function enableDragMode() {
        const cats = document.querySelectorAll('.cat');
        
        cats.forEach(catElement => {
            catElement.addEventListener('mousedown', startDrag);
            catElement.addEventListener('touchstart', startDrag);
            
            // 添加猫咪编号标签
            const catId = parseInt(catElement.dataset.id);
            const catLabelElement = document.createElement('div');
            catLabelElement.className = 'cat-label';
            catLabelElement.textContent = `cat${catId}`;
            catLabelElement.style.position = 'absolute';
            catLabelElement.style.top = '-20px';
            catLabelElement.style.left = '0';
            catLabelElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            catLabelElement.style.color = 'white';
            catLabelElement.style.padding = '2px 5px';
            catLabelElement.style.borderRadius = '3px';
            catLabelElement.style.fontSize = '12px';
            catLabelElement.style.pointerEvents = 'none'; // 防止标签影响拖动
            catElement.appendChild(catLabelElement);
        });
        
        // 更新坐标显示
        updateCoordinatesDisplay();
        
        // 更新所有猫咪位置和缩放
        updateAllCatsPositions();
    }
    
    // 禁用拖动模式
    function disableDragMode() {
        const cats = document.querySelectorAll('.cat');
        
        cats.forEach(catElement => {
            catElement.removeEventListener('mousedown', startDrag);
            catElement.removeEventListener('touchstart', startDrag);
            
            // 移除猫咪编号标签
            const catLabel = catElement.querySelector('.cat-label');
            if (catLabel) {
                catElement.removeChild(catLabel);
            }
            
            // 确保猫咪在游戏模式下正确显示
            const catId = parseInt(catElement.dataset.id);
            const cat = catsData.find(c => c.id === catId);
            if (cat && cat.found) {
                catElement.classList.add('found');
            }
        });
        
        // 重新更新所有猫咪位置和缩放，确保游戏状态正确
        updateAllCatsPositions();
    }
    
    // 开始拖动
    function startDrag(e) {
        e.preventDefault();
        
        // 获取当前拖动的猫咪元素
        draggedCat = this;
        
        // 获取猫咪元素的位置和尺寸
        const rect = draggedCat.getBoundingClientRect();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        
        // 立即将猫咪中心点移动到鼠标位置
        // 由于猫咪元素已经应用了transform: translate(-50%, -50%)，
        // 所以style.left和style.top设置的位置就是猫咪的中心点
        // 我们不需要额外的偏移量，直接将鼠标位置作为猫咪的新位置
        dragOffsetX = 0;
        dragOffsetY = 0;
        
        // 立即更新猫咪位置到鼠标位置
        if (backgroundRect) {
            const newX = clientX - backgroundRect.left;
            const newY = clientY - backgroundRect.top;
            
            // 设置猫咪元素的新位置
            draggedCat.style.left = `${clientX}px`;
            draggedCat.style.top = `${clientY}px`;
            
            // 更新猫咪数据中的位置（相对比例）
            const catId = parseInt(draggedCat.dataset.id);
            const catIndex = catsData.findIndex(cat => cat.id === catId);
            
            if (catIndex !== -1) {
                catsData[catIndex].x = newX / backgroundRect.width;
                catsData[catIndex].y = newY / backgroundRect.height;
                
                // 更新坐标显示
                updateCoordinatesDisplay();
            }
        }
        
        // 添加移动和结束拖动事件监听器
        document.addEventListener('mousemove', dragMove);
        document.addEventListener('touchmove', dragMove);
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
    }
    
    // 拖动移动
    function dragMove(e) {
        if (!draggedCat) return;
        
        e.preventDefault();
        
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        
        // 获取背景图的位置和尺寸
        backgroundRect = background.getBoundingClientRect();
        
        // 直接使用鼠标位置作为猫咪中心点位置
        // 计算新位置（相对于背景图）
        let newX = clientX - backgroundRect.left;
        let newY = clientY - backgroundRect.top;
        
        // 在调试模式下，允许猫咪坐标为负值，以便正确定位靠近边缘的猫咪
        // 在游戏模式下，仍然限制在背景图范围内
        if (isDebugMode) {
            // 允许坐标为负值，但仍然限制最大值
            newX = Math.min(newX, backgroundRect.width);
            newY = Math.min(newY, backgroundRect.height);
        } else {
            // 游戏模式下限制在背景图范围内
            newX = Math.max(0, Math.min(newX, backgroundRect.width));
            newY = Math.max(0, Math.min(newY, backgroundRect.height));
        }
        
        // 设置猫咪元素的新位置，直接使用鼠标位置
        draggedCat.style.left = `${clientX}px`;
        draggedCat.style.top = `${clientY}px`;
        
        // 更新猫咪数据中的位置（相对比例）
        const catId = parseInt(draggedCat.dataset.id);
        const catIndex = catsData.findIndex(cat => cat.id === catId);
        
        if (catIndex !== -1) {
            // 确保x和y的值在0到1之间，即使猫咪贴近边缘
            catsData[catIndex].x = newX / backgroundRect.width;
            catsData[catIndex].y = newY / backgroundRect.height;
            
            // 更新坐标显示
            updateCoordinatesDisplay();
        }
    }
    
    // 结束拖动
    function endDrag() {
        draggedCat = null;
        
        // 移除事件监听器
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('touchmove', dragMove);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchend', endDrag);
    }
    
    // 更新坐标显示
    function updateCoordinatesDisplay() {
        let html = '<h3>猫咪坐标：</h3>';
        
        catsData.forEach(cat => {
            html += `<div>cat${cat.id} - ${cat.name}: x=${cat.x.toFixed(3)}, y=${cat.y.toFixed(3)}</div>`;
        });
        
        coordinatesDisplay.innerHTML = html;
    }
    
    // 窗口大小改变时更新猫咪位置
    window.addEventListener('resize', () => {
        updateAllCatsPositions();
    });
    
    // 开始游戏按钮点击事件
    startGameButton.addEventListener('click', () => {
        if (!isGameActive) {
            // 开始游戏
            isGameActive = true;
            startGameButton.textContent = '结束游戏';
            startGameButton.classList.add('stop');
            initGame();
            // 确保开始游戏时添加猫咪点击事件
            setTimeout(addCatClickEvents, 500); // 延迟一点时间确保猫咪元素已创建
        } else {
            // 结束游戏
            isGameActive = false;
            startGameButton.textContent = '开始游戏';
            startGameButton.classList.remove('stop');
            // 停止计时
            if (gameTimer) clearInterval(gameTimer);
            // 隐藏所有猫咪
            const cats = document.querySelectorAll('.cat');
            cats.forEach(cat => {
                cat.classList.remove('found');
            });
        }
    });
    
    // 初始化页面，但不自动开始游戏
    totalCountElement.textContent = catsData.length;
    createCats();
});