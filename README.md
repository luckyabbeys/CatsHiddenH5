<!--
 * @Author: luckyabbeys squall_dl@126.com
 * @Date: 2025-04-27 13:30:42
 * @LastEditors: luckyabbeys squall_dl@126.com
 * @LastEditTime: 2025-04-27 13:30:46
 * @FilePath: \CatsHiddenH5\README.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
# 寻找隐藏的猫咪 - H5网页游戏

这是一个有趣的H5网页游戏，玩家需要在背景图片中找到所有隐藏的猫咪。

## 游戏特点

- 全屏显示背景图片，隐藏10只可爱的猫咪
- 顶部显示已找到猫咪的计数器
- 点击场景中的猫咪位置，如果找对了会显示猫咪并播放音效
- 找到所有猫咪后会显示胜利提示和烟花效果
- 支持响应式布局，适配不同设备
- 使用localStorage保存最佳记录

## 如何使用

1. 准备资源文件：
   - 在`images`目录中添加背景图片`background.jpg`
   - 在`images`目录中添加10个透明PNG格式的猫咪图片，命名为`cat1.png`到`cat10.png`
   - 在`sounds`目录中添加猫叫声音效`meow.mp3`

2. 打开游戏：
   - 直接在浏览器中打开`index.html`文件
   - 或者使用本地服务器运行项目

3. 游戏玩法：
   - 仔细查看背景图片，寻找隐藏的猫咪
   - 点击你认为有猫咪的位置
   - 如果点对了，会显示猫咪图片并播放音效
   - 找到所有10只猫咪后获得胜利

## 调试模式

游戏提供了调试模式，方便开发者放置猫咪位置：

1. 点击右下角的"调试模式"按钮开启调试
2. 在调试模式下，可以拖动猫咪图片到背景图的任意位置
3. 调整好位置后，点击"保存位置"按钮保存坐标
4. 坐标会自动保存到localStorage中
5. 再次点击"调试模式"按钮关闭调试模式

## 技术实现

- 纯HTML/CSS/JavaScript实现，无需额外框架
- 使用绝对定位和相对坐标系统放置猫咪
- 响应式设计，支持不同屏幕尺寸
- 使用Canvas实现烟花特效

## 自定义设置

如果需要修改游戏设置，可以编辑以下文件：

- `js/cats-data.js` - 修改猫咪数量、名称和初始位置
- `js/game.js` - 修改游戏逻辑和交互行为
- `css/style.css` - 自定义游戏界面样式

祝您游戏愉快！