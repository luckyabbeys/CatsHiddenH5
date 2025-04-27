// 猫咪数据
const catsData = [
    {
        id: 1,
        name: "小花",
        image: "./images/cat1.png",
        x: 0.2, // 相对于背景图的x坐标比例
        y: 0.3, // 相对于背景图的y坐标比例
        found: false
    },
    {
        id: 2,
        name: "黑豆",
        image: "./images/cat2.png",
        x: 0.5,
        y: 0.6,
        found: false
    },
    {
        id: 3,
        name: "橘子",
        image: "./images/cat3.png",
        x: 0.8,
        y: 0.2,
        found: false
    },
    {
        id: 4,
        name: "雪球",
        image: "./images/cat4.png",
        x: 0.3,
        y: 0.7,
        found: false
    },
    {
        id: 5,
        name: "灰灰",
        image: "./images/cat5.png",
        x: 0.7,
        y: 0.5,
        found: false
    },
    {
        id: 6,
        name: "奶油",
        image: "./images/cat6.png",
        x: 0.1,
        y: 0.8,
        found: false
    },
    {
        id: 7,
        name: "咖啡",
        image: "./images/cat7.png",
        x: 0.9,
        y: 0.4,
        found: false
    },
    {
        id: 8,
        name: "豆豆",
        image: "./images/cat8.png",
        x: 0.4,
        y: 0.1,
        found: false
    },
    {
        id: 9,
        name: "斑斑",
        image: "./images/cat9.png",
        x: 0.6,
        y: 0.9,
        found: false
    },
    {
        id: 10,
        name: "毛毛",
        image: "./images/cat10.png",
        x: 0.2,
        y: 0.5,
        found: false
    }
];

// 从localStorage加载猫咪位置数据（如果有）
function loadCatsPositions() {
    const savedPositions = localStorage.getItem('catsPositions');
    if (savedPositions) {
        const positions = JSON.parse(savedPositions);
        positions.forEach((pos, index) => {
            if (index < catsData.length) {
                catsData[index].x = pos.x;
                catsData[index].y = pos.y;
            }
        });
    }
}

// 保存猫咪位置数据到localStorage
function saveCatsPositions() {
    const positions = catsData.map(cat => ({
        x: cat.x,
        y: cat.y
    }));
    localStorage.setItem('catsPositions', JSON.stringify(positions));
}

// 初始化加载猫咪位置
loadCatsPositions();