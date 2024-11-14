phina.globalize();

//バナー広告の縦幅
const BANNER_HEIGHT = 0;
// const BANNER_HEIGHT = 60;

//canvasの比率 最大4:3
const CANVAS_RATIO = Math.max(
    (window.innerHeight - BANNER_HEIGHT) / window.innerWidth,
    4.5 / 3
);

//ピクセル拡大率
const PIXEL_SCALE = 4 * window.devicePixelRatio;

//ピクセルとして扱う解像度
const CANVAS_PIXEL_WIDTH = 128;
const CANVAS_PIXEL_HEIGHT = Math.floor(CANVAS_PIXEL_WIDTH * CANVAS_RATIO);

//実際の解像度
const CANVAS_WIDTH = CANVAS_PIXEL_WIDTH * PIXEL_SCALE;
const CANVAS_HEIGHT = Math.floor(CANVAS_WIDTH * CANVAS_RATIO);

const ASSETS = {
    'image': {
        'flash': 'assets/images/flash.png',
        'block_ab': 'assets/images/block_ab.png',
        'land': 'assets/images/land5.png',
        'gauge_frame':'assets/images/gauge_frame.png',
        'gauge_fill':'assets/images/gauge_fill.png',
        'blocks': 'assets/images/blocks3.png',
        'logo': 'assets/images/logo5.png',
        'mountains': 'assets/images/mountains2.png',
        'clock': 'assets/images/clock.png',
        'crown': 'assets/images/crown.png',
        'button_frame32x16': 'assets/images/button_frame32x16.png',
        'button_frame80x16': 'assets/images/button_frame80x16.png',
        'button_frame96x126': 'assets/images/button_frame96x126.png',
        'mouse': 'assets/images/mouse.png',
        'twitter_frame64x16': 'assets/images/twitter_frame64x16.png',
        'tutorial1': 'assets/images/tutorial1.png',
        'tutorial2': 'assets/images/tutorial2.png',
        'tutorial3': 'assets/images/tutorial3.png',

        'button_credit': 'assets/images/button_credit.png',
        'button_frame96x80': 'assets/images/button_frame96x80.png',
        'text_credits': 'assets/images/text_credits.png',

    },
    
    'font': {
        'PixelMplus': 'assets/fonts/PixelMplus12-Regular.ttf',
    }
}

phina.main(function() {
    
    let canvas = document.getElementById('canvas');
    
    let app = GameApp({
        'startLabel': 'main',
        'width': CANVAS_WIDTH,
        'height': CANVAS_HEIGHT,
        'assets': ASSETS,
        'fps': 30,
        
//        'scenes': [
//            {
//                'className': 'TitleScene',
//                'label': 'title',
//                'nextLabel': 'game',
//            },
//            {
//                'className': 'GameScene',
//                'label': 'game',
//                'nextLabel': 'title',
//            }
//        ],
        
        'scenes': [
            {'className': 'MainScene', 'label':'main', 'nextLabel':'main'}
        ],
        
        'query':'canvas', //既にあるcanvas要素を使う
        'fit':false, //自前でCSS書くので無効化
        'pixelated':true, //アンチエイリアス切る
        
    });
    
    app.run();
    
    Twitter.SetUser('AsazukeMochi');
    Twitter.SetHashTags(['ブロックボンバー', 'BlockBomber']);
    Twitter.SetUrl('https://app.azm-it.com/games/block');
    
    GA.AddEvent('share');
    GA.AddEvent('game_clear');
    
});