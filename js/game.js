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
    window.scale = 1; // 将scale设为全局变量，以便cats-data.js中的函数可以访问
    let scale = window.scale; // 本地引用
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
    
    // 添加窗口大小变化的事件监听器
    window.addEventListener('resize', function() {
        // 当窗口大小或浏览器缩放比例变化时，更新所有猫咪位置
        console.log('窗口大小或缩放比例变化，更新猫咪位置');
        // 延迟执行，确保浏览器完成缩放
        setTimeout(updateAllCatsPositions, 100);
    });
    
    // 添加浏览器缩放检测（某些浏览器支持）
    window.addEventListener('zoom', function() {
        console.log('浏览器缩放比例变化，更新猫咪位置');
        setTimeout(updateAllCatsPositions, 100);
    });
    
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
        
        // 获取当前浏览器缩放比例
        const browserZoom = window.devicePixelRatio || 1;
        
        // 获取背景图的位置和尺寸
        backgroundRect = background.getBoundingClientRect();
        
        // 计算背景图的实际缩放比例
        // 由于背景图使用了object-fit: contain，需要计算实际的缩放比例
        const backgroundNaturalWidth = background.naturalWidth;
        const backgroundNaturalHeight = background.naturalHeight;
        const containerWidth = backgroundRect.width;
        const containerHeight = backgroundRect.height;
        
        // 计算背景图的实际缩放比例
        let scaleRatio;
        if (backgroundNaturalWidth / backgroundNaturalHeight > containerWidth / containerHeight) {
            // 宽度适配，高度居中
            scaleRatio = containerWidth / backgroundNaturalWidth;
        } else {
            // 高度适配，宽度居中
            scaleRatio = containerHeight / backgroundNaturalHeight;
        }
        
        // 保存全局缩放比例，以便其他函数使用
        scale = scaleRatio;
        window.scale = scaleRatio; // 同时更新全局变量，确保cats-data.js中的函数可以访问
        
        // 计算背景图的实际显示尺寸
        const scaledWidth = backgroundNaturalWidth * scaleRatio;
        const scaledHeight = backgroundNaturalHeight * scaleRatio;
        
        // 计算背景图的实际显示位置（考虑居中）
        const offsetX = (containerWidth - scaledWidth) / 2;
        const offsetY = (containerHeight - scaledHeight) / 2;
        
        // 在调试模式下，保持猫咪的原始位置不变
        // 在非调试模式下，限制猫咪坐标在背景图范围内
        if (!isDebugMode) {
            // 限制猫咪坐标在0到1之间，确保不会超出背景图
            cat.x = Math.max(0.02, Math.min(cat.x, 0.98));
            cat.y = Math.max(0.02, Math.min(cat.y, 0.98));
        } else {
            // 在调试模式下，输出当前应用的位置信息
            console.log(`调试模式 - 应用猫咪 ${cat.id}(${cat.name}) 位置: (${cat.x.toFixed(4)}, ${cat.y.toFixed(4)})`);
        }
        
        // 计算猫咪在背景图上的实际位置 - 使用相对于背景图的百分比位置
        // 这样即使在浏览器缩放时，猫咪也会保持相对于背景图的正确位置
        // 修正计算方式，确保在不同缩放比例下位置一致
        // 考虑背景图的实际显示区域和偏移量
        const relativeX = offsetX + (cat.x * scaledWidth);
        const relativeY = offsetY + (cat.y * scaledHeight);
        
        // 设置猫咪位置 - 使用相对于视口的位置，而不是相对于文档的位置
        // 这样可以避免浏览器缩放导致的位置偏移
        catElement.style.left = `${relativeX}px`;
        catElement.style.top = `${relativeY}px`;
        
        // 强制移除任何可能的内联样式限制
        catElement.style.maxWidth = 'none';
        catElement.style.maxHeight = 'none';
        catElement.style.width = 'auto';
        catElement.style.height = 'auto';
        
        // 使用与背景图相同的缩放比例来缩放猫咪图片
        // 同时使用translate进行居中定位
        // 使用scale函数而不是matrix，确保在游戏模式和调试模式下一致
        // 将缩放系数保留4位小数，避免精度问题
        const fixedScaleRatio = parseFloat(scaleRatio.toFixed(4));
        catElement.style.transform = `translate(-50%, -50%) scale(${fixedScaleRatio})`;
        
        // 强制应用transform，确保浏览器不会优化为matrix
        void catElement.offsetWidth;
        
        // 确保猫咪在游戏模式和调试模式下都能正确显示
        if (cat.found) {
            catElement.classList.add('found');
        }
        
        // 输出调试信息
        if (isDebugMode) {
            console.log(`猫咪 ${cat.id} 位置更新: 相对位置(${cat.x.toFixed(4)}, ${cat.y.toFixed(4)}), 实际位置(${relativeX.toFixed(0)}, ${relativeY.toFixed(0)}), 缩放比例: ${fixedScaleRatio}, 浏览器缩放: ${browserZoom}`);
        }
    }
    
    // 更新所有猫咪位置
    function updateAllCatsPositions() {
        // 确保背景图已加载
        if (!background.complete) {
            // 如果背景图未加载完成，等待加载完成后再更新位置
            background.onload = function() {
                updateAllCatsPositions();
            };
            return;
        }
        
        // 获取背景图的位置和尺寸
        backgroundRect = background.getBoundingClientRect();
        
        // 计算背景图的实际缩放比例
        const backgroundNaturalWidth = background.naturalWidth;
        const backgroundNaturalHeight = background.naturalHeight;
        const containerWidth = backgroundRect.width;
        const containerHeight = backgroundRect.height;
        
        // 计算背景图的实际缩放比例
        let scaleRatio;
        if (backgroundNaturalWidth / backgroundNaturalHeight > containerWidth / containerHeight) {
            // 宽度适配，高度居中
            scaleRatio = containerWidth / backgroundNaturalWidth;
        } else {
            // 高度适配，宽度居中
            scaleRatio = containerHeight / backgroundNaturalHeight;
        }
        
        // 保存全局缩放比例，以便其他函数使用
        scale = scaleRatio;
        window.scale = scaleRatio; // 同时更新全局变量，确保cats-data.js中的函数可以访问
        
        // 更新所有猫咪位置
        const cats = document.querySelectorAll('.cat');
        cats.forEach(catElement => {
            // 先清除可能影响缩放的内联样式
            catElement.style.maxWidth = 'none';
            catElement.style.maxHeight = 'none';
            catElement.style.width = 'auto';
            catElement.style.height = 'auto';
            
            const catId = parseInt(catElement.dataset.id);
            const cat = catsData.find(c => c.id === catId);
            if (cat) {
                updateCatPosition(catElement, cat);
            }
        });
        
        // 输出当前缩放比例，帮助调试
        console.log(`更新猫咪位置 - 缩放比例: ${scaleRatio}, 游戏模式: ${isGameActive ? '游戏' : '非游戏'}, 调试模式: ${isDebugMode ? '是' : '否'}`);
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
            // 在添加found类之前先保存当前transform
            const currentTransform = catElement.style.transform;
            
            // 添加found类使猫咪可见
            catElement.classList.add('found');
            
            // 确保transform不被CSS规则覆盖
            if (currentTransform) {
                catElement.style.transform = currentTransform;
                // 强制应用transform
                void catElement.offsetWidth;
            }
            
            // 添加日志输出猫咪的坐标和缩放系数
            console.log(`游戏模式 - 找到猫咪 ${cat.id}(${cat.name}): 坐标(x=${cat.x.toFixed(4)}, y=${cat.y.toFixed(4)}), 缩放系数: ${scale.toFixed(4)}`);
            
            // 获取猫咪元素的计算样式
            const catStyle = window.getComputedStyle(catElement);
            const catTransform = catStyle.getPropertyValue('transform');
            console.log(`游戏模式 - 猫咪 ${cat.id} 元素样式: left=${catElement.style.left}, top=${catElement.style.top}, transform=${catTransform}`);
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
        
        // 获取背景图的实际缩放比例和尺寸
        const backgroundNaturalWidth = background.naturalWidth;
        const backgroundNaturalHeight = background.naturalHeight;
        const containerWidth = rect.width;
        const containerHeight = rect.height;
        
        // 计算背景图的实际缩放比例
        let scaleRatio;
        if (backgroundNaturalWidth / backgroundNaturalHeight > containerWidth / containerHeight) {
            scaleRatio = containerWidth / backgroundNaturalWidth;
        } else {
            scaleRatio = containerHeight / backgroundNaturalHeight;
        }
        
        // 计算背景图的实际显示尺寸
        const scaledWidth = backgroundNaturalWidth * scaleRatio;
        const scaledHeight = backgroundNaturalHeight * scaleRatio;
        
        // 计算背景图的实际显示位置（考虑居中）
        const offsetX = (containerWidth - scaledWidth) / 2;
        const offsetY = (containerHeight - scaledHeight) / 2;
        
        // 检测是否点击到猫咪
        catsData.forEach(cat => {
            // 计算猫咪在背景图上的实际位置
            const catX = offsetX + (cat.x * scaledWidth);
            const catY = offsetY + (cat.y * scaledHeight);
            
            // 计算点击位置与猫咪位置的距离
            const distance = Math.sqrt(
                Math.pow(clickX - catX, 2) + 
                Math.pow(clickY - catY, 2)
            );
            
            // 增加检测范围到40像素，提高点击精度
            // 根据缩放比例调整检测范围
            const detectionRadius = 40 * scaleRatio;
            if (distance <= detectionRadius) {
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
        winMessage.classList.remove('show');
        fireworks.stop();
        // 回到初始状态而不是直接开始新游戏
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
        // 重置猫咪状态
        catsData.forEach(cat => {
            cat.found = false;
        });
        // 更新计数器
        updateCounter();
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
        
        // 强制更新所有猫咪位置，确保模式切换后猫咪位置和大小正确
        setTimeout(updateAllCatsPositions, 100);
    });
    
    
    // 保存猫咪位置
    savePositionsButton.addEventListener('click', () => {
        saveCatsPositions();
        alert('猫咪位置已保存！');
    });
    
    // 启用拖动模式
    function enableDragMode() {
        const cats = document.querySelectorAll('.cat');
        
        // 记录进入调试模式前的猫咪数据，用于后续恢复
        window.catPositionsBeforeDebug = {};
        
        // 首先保存所有猫咪的当前位置数据
        cats.forEach(catElement => {
            const catId = parseInt(catElement.dataset.id);
            const cat = catsData.find(c => c.id === catId);
            if (cat) {
                // 保存猫咪的原始坐标数据（相对坐标）
                window.catPositionsBeforeDebug[catId] = {
                    x: cat.x,
                    y: cat.y,
                    left: catElement.style.left,
                    top: catElement.style.top,
                    transform: catElement.style.transform
                };
                
                console.log(`调试模式 - 保存猫咪 ${cat.id}(${cat.name}) 的原始位置: (${cat.x.toFixed(4)}, ${cat.y.toFixed(4)})`);
            }
            
            // 添加拖动事件监听器
            catElement.addEventListener('mousedown', startDrag);
            catElement.addEventListener('touchstart', startDrag);
            
            // 添加猫咪编号标签
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
        
        // 输出日志，帮助调试
        console.log('已启用调试模式，保持猫咪位置不变');
    }
    
    // 禁用拖动模式
    function disableDragMode() {
        const cats = document.querySelectorAll('.cat');
        
        // 移除拖动事件和标签
        cats.forEach(catElement => {
            const catId = parseInt(catElement.dataset.id);
            
            // 移除拖动事件监听器
            catElement.removeEventListener('mousedown', startDrag);
            catElement.removeEventListener('touchstart', startDrag);
            
            // 移除猫咪编号标签
            const catLabel = catElement.querySelector('.cat-label');
            if (catLabel) {
                catElement.removeChild(catLabel);
            }
            
            // 确保猫咪在游戏模式下正确显示
            const cat = catsData.find(c => c.id === catId);
            if (cat && cat.found) {
                catElement.classList.add('found');
            }
            
            // 从保存的数据中恢复猫咪位置
            if (window.catPositionsBeforeDebug && window.catPositionsBeforeDebug[catId]) {
                const savedPosition = window.catPositionsBeforeDebug[catId];
                
                // 恢复猫咪的相对坐标
                if (cat) {
                    cat.x = savedPosition.x;
                    cat.y = savedPosition.y;
                    console.log(`关闭调试模式 - 恢复猫咪 ${cat.id}(${cat.name}) 的原始位置: (${cat.x.toFixed(4)}, ${cat.y.toFixed(4)})`);
                }
                
                // 恢复猫咪的样式属性
                catElement.style.left = savedPosition.left;
                catElement.style.top = savedPosition.top;
                catElement.style.transform = savedPosition.transform;
                
                // 强制应用样式
                void catElement.offsetWidth;
            }
        });
        
        // 输出日志，帮助调试
        console.log('已关闭调试模式，恢复猫咪原始位置');
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
        
        // 记录拖动开始前的位置，用于调试日志
        const catId = parseInt(draggedCat.dataset.id);
        const cat = catsData.find(c => c.id === catId);
        if (cat) {
            console.log(`开始拖动猫咪 ${cat.id}(${cat.name}) - 起始位置: (${cat.x.toFixed(4)}, ${cat.y.toFixed(4)})`);
        }
        
        // 立即将猫咪中心点移动到鼠标位置
        // 由于猫咪元素已经应用了transform: translate(-50%, -50%)，
        // 所以style.left和style.top设置的位置就是猫咪的中心点
        // 我们不需要额外的偏移量，直接将鼠标位置作为猫咪的新位置
        dragOffsetX = 0;
        dragOffsetY = 0;
        
        // 立即更新猫咪位置到鼠标位置
        if (backgroundRect) {
            // 计算背景图的实际缩放比例
            const backgroundNaturalWidth = background.naturalWidth;
            const backgroundNaturalHeight = background.naturalHeight;
            const containerWidth = backgroundRect.width;
            const containerHeight = backgroundRect.height;
            
            // 计算背景图的实际缩放比例
            let scaleRatio;
            if (backgroundNaturalWidth / backgroundNaturalHeight > containerWidth / containerHeight) {
                // 宽度适配，高度居中
                scaleRatio = containerWidth / backgroundNaturalWidth;
            } else {
                // 高度适配，宽度居中
                scaleRatio = containerHeight / backgroundNaturalHeight;
            }
            
            // 计算背景图的实际显示尺寸
            const scaledWidth = backgroundNaturalWidth * scaleRatio;
            const scaledHeight = backgroundNaturalHeight * scaleRatio;
            
            // 计算背景图的实际显示位置（考虑居中）
            const offsetX = (containerWidth - scaledWidth) / 2;
            const offsetY = (containerHeight - scaledHeight) / 2;
            
            // 计算鼠标在背景图上的相对位置
            const relativeX = (clientX - backgroundRect.left - offsetX) / scaledWidth;
            const relativeY = (clientY - backgroundRect.top - offsetY) / scaledHeight;
            
            // 设置猫咪元素的新位置
            draggedCat.style.left = `${clientX}px`;
            draggedCat.style.top = `${clientY}px`;
            
            // 更新猫咪数据中的位置（相对比例）
            const catId = parseInt(draggedCat.dataset.id);
            const catIndex = catsData.findIndex(cat => cat.id === catId);
            
            if (catIndex !== -1) {
                catsData[catIndex].x = relativeX;
                catsData[catIndex].y = relativeY;
                
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
        
        // 计算背景图的实际缩放比例
        const backgroundNaturalWidth = background.naturalWidth;
        const backgroundNaturalHeight = background.naturalHeight;
        const containerWidth = backgroundRect.width;
        const containerHeight = backgroundRect.height;
        
        // 计算背景图的实际缩放比例
        let scaleRatio;
        if (backgroundNaturalWidth / backgroundNaturalHeight > containerWidth / containerHeight) {
            // 宽度适配，高度居中
            scaleRatio = containerWidth / backgroundNaturalWidth;
        } else {
            // 高度适配，宽度居中
            scaleRatio = containerHeight / backgroundNaturalHeight;
        }
        
        // 计算背景图的实际显示尺寸
        const scaledWidth = backgroundNaturalWidth * scaleRatio;
        const scaledHeight = backgroundNaturalHeight * scaleRatio;
        
        // 计算背景图的实际显示位置（考虑居中）
        const offsetX = (containerWidth - scaledWidth) / 2;
        const offsetY = (containerHeight - scaledHeight) / 2;
        
        // 计算鼠标在背景图上的相对位置
        let relativeX = (clientX - backgroundRect.left - offsetX) / scaledWidth;
        let relativeY = (clientY - backgroundRect.top - offsetY) / scaledHeight;
        
        // 在调试模式下，允许猫咪坐标为负值，以便正确定位靠近边缘的猫咪
        // 在游戏模式下，仍然限制在背景图范围内
        if (!isDebugMode) {
            // 游戏模式下限制在背景图范围内，留出一点边距(2%)确保猫咪不会完全贴边
            relativeX = Math.max(0.02, Math.min(relativeX, 0.98));
            relativeY = Math.max(0.02, Math.min(relativeY, 0.98));
        }
        
        // 设置猫咪元素的新位置，直接使用鼠标位置
        draggedCat.style.left = `${clientX}px`;
        draggedCat.style.top = `${clientY}px`;
        
        // 更新猫咪数据中的位置（相对比例）
        const catId = parseInt(draggedCat.dataset.id);
        const catIndex = catsData.findIndex(cat => cat.id === catId);
        
        if (catIndex !== -1) {
            // 保存相对于背景图的位置比例
            catsData[catIndex].x = relativeX;
            catsData[catIndex].y = relativeY;
            
            // 更新坐标显示
            updateCoordinatesDisplay();
        }
    }
    
    // 结束拖动
    function endDrag() {
        if (!draggedCat) return;
        
        // 记录拖动结束后的位置，用于调试日志
        const catId = parseInt(draggedCat.dataset.id);
        const cat = catsData.find(c => c.id === catId);
        if (cat) {
            console.log(`结束拖动猫咪 ${cat.id}(${cat.name}) - 最终位置: (${cat.x.toFixed(4)}, ${cat.y.toFixed(4)})`);
            
            // 更新保存的位置数据，确保在切换模式时能正确恢复
            if (window.catPositionsBeforeDebug && window.catPositionsBeforeDebug[catId]) {
                // 只更新样式属性，保留原始坐标数据
                window.catPositionsBeforeDebug[catId].left = draggedCat.style.left;
                window.catPositionsBeforeDebug[catId].top = draggedCat.style.top;
                window.catPositionsBeforeDebug[catId].transform = draggedCat.style.transform;
            }
        }
        
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
    // 监听窗口大小变化，确保猫咪和背景图同步缩放
    window.addEventListener('resize', () => {
        // 当窗口大小变化时，重新计算所有猫咪的位置和缩放比例
        // 使用防抖函数避免频繁触发
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(() => {
            console.log('窗口大小变化，更新猫咪位置');
            updateAllCatsPositions();
        }, 100);
    });
    
    // 监听浏览器缩放变化
    window.addEventListener('zoom', () => {
        updateAllCatsPositions();
    });
    
    // 监听页面缩放（如果浏览器支持visualViewport API）
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => {
            clearTimeout(window.viewportResizeTimer);
            window.viewportResizeTimer = setTimeout(() => {
                updateAllCatsPositions();
            }, 100);
        });
        
        // 监听滚动事件，确保位置正确
        window.visualViewport.addEventListener('scroll', () => {
            clearTimeout(window.viewportScrollTimer);
            window.viewportScrollTimer = setTimeout(() => {
                updateAllCatsPositions();
            }, 100);
        });
    }
    
    // 定期检查设备像素比是否变化，以捕获浏览器缩放
    let currentPixelRatio = window.devicePixelRatio || 1;
    setInterval(() => {
        const newPixelRatio = window.devicePixelRatio || 1;
        if (currentPixelRatio !== newPixelRatio) {
            currentPixelRatio = newPixelRatio;
            updateAllCatsPositions();
        }
    }, 1000); // 每秒检查一次
    
    // 强制初始更新所有猫咪位置
    setTimeout(updateAllCatsPositions, 500);
    
    // 开始游戏按钮点击事件
    startGameButton.addEventListener('click', () => {
        if (!isGameActive) {
            // 开始游戏
            isGameActive = true;
            startGameButton.textContent = '结束游戏';
            startGameButton.classList.add('stop');
            initGame();
            // 确保开始游戏时添加猫咪点击事件
            setTimeout(() => {
                addCatClickEvents();
                // 强制更新所有猫咪位置，确保游戏模式下猫咪位置正确
                console.log('游戏开始，强制更新猫咪位置');
                updateAllCatsPositions();
                
                // 再次延迟更新，确保所有样式都已应用
                setTimeout(() => {
                    console.log('游戏开始后再次更新猫咪位置');
                    updateAllCatsPositions();
                }, 300);
            }, 500); // 延迟一点时间确保猫咪元素已创建
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
            // 强制更新所有猫咪位置
            setTimeout(updateAllCatsPositions, 100);
        }
    });
    
    // 初始化页面，但不自动开始游戏
    // 先加载保存的猫咪位置
    loadCatsPositions();
    totalCountElement.textContent = catsData.length;
    createCats();
    
    // 确保猫咪位置在页面加载后正确显示
    setTimeout(() => {
        console.log('页面初始化完成，更新猫咪位置');
        updateAllCatsPositions();
    }, 500);
});