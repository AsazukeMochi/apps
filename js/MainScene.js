phina.define('MainScene', {
    'superClass': 'DisplayScene',
    'init': function(params) {
        this.superInit(params);
        
        this.backgroundColor = '#87ceeb';
        this.phase = MainScene.Phases.Start;
        
        this.mountains = PixelSprite('mountains').addChildTo(this);
        this.mountains.position.set(CANVAS_WIDTH / 2, 158 * PIXEL_SCALE);
        this.mountains.origin.set(0.5, 1);
        this.mountains.scale.set(PIXEL_SCALE, PIXEL_SCALE);
        this.ground = Ground().addChildTo(this);
        this.ground.position.set(
            0,
            156 * PIXEL_SCALE
        );
        
        this.titleController = null;
        this.gameController = null;
        this.resultController = null;
        
        let fade = RectangleShape({
            'width': CANVAS_WIDTH,
            'height': CANVAS_HEIGHT,
            'fill': '#444'
        }).addChildTo(this);
        fade.position.set(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        
        const w = 100;
        fade.tweener.set({'alpha':0.7}).wait(w)
            .set({'alpha':0.3}).wait(w)
            .set({'alpha':0.1}).wait(w).call(function(){
            this.target.remove();
        }).play();
        
        this.tweener.wait(500).call(function(){
            this.target.nextPhase({'twitter':!!Cookie.Get('playCnt')});
        }).play();
        
    },
    
    'update': function(app){
        Timer.set(app.deltaTime);
        
    },
    
    'nextPhase': function(params) {
        params = params || {};
        let next = [
            MainScene.Phases.Title,
            MainScene.Phases.Game, 
            MainScene.Phases.Result,
            MainScene.Phases.ThankYou,
            MainScene.Phases.Title,
        ][this.phase];
        
        switch (next) {
            case MainScene.Phases.Title:
                
                if (this.gameController) {
                    this.gameController.remove();
                    this.gameController = null;
                }
                
                this.titleController = TitleController(params).addChildTo(this);
                break;
                
            case MainScene.Phases.Game:
                this.titleController.remove();
                this.titleController = null;
                this.gameController = GameController(params).addChildTo(this);
                break;
                
            case MainScene.Phases.Result:
                
                //プレイ回数をCookieに記録
                let playCnt = Cookie.Get('playCnt') || '0';
                playCnt = Number(playCnt);
                playCnt += 1;
                Cookie.Set('playCnt', playCnt, Cookie.Year);
                
                //ゲームクリアイベントを送信
                GA.SendEvent('game_clear', playCnt);
                
                //ハイスコア更新してたらCookieに保存
                let highScore = Cookie.Get('high_score') || '0';
                highScore = Number(highScore);
                params.scores.$safe({'high':highScore});
                if (highScore < params.scores.total) {
                    Cookie.Set('high_score', params.scores.total, Cookie.Year);
                }
                
                this.resultController = ResultController(params).addChildTo(this);
                break;
                
            case MainScene.Phases.ThankYou:
                this.resultController.remove();
                this.resultController = null;
                
                this.gameController.startThankYou();
                
                break;
                
            default: 
                break;
        }
        
        this.phase = next;
    },
    
    _static: {
        'Phases': {'Start': 0, 'Title': 1, 'Game': 2, 'Result': 3, 'ThankYou': 4}
        
    }
})

phina.define('Ground', {
    'superClass': 'DisplayElement',
    'init': function() {
        this.superInit();
        this.scale.set(PIXEL_SCALE, PIXEL_SCALE);
        
        const size = Math.floor(CANVAS_PIXEL_WIDTH / 16);
        
        for (let i = 0; i < size; ++i) {
            let chip = PixelSprite('land').addChildTo(this);
            chip.origin.set(0, 0);
            chip.position.set(
                16 * i,
                0
            );
        }
        
        let under = RectangleShape({
            'width':CANVAS_PIXEL_WIDTH,
            'height':64,
            'fill':'#343434',
            'strokeWidth':0,
            'padding':0
        }).addChildTo(this);
        under.origin.set(0, 0);
        under.position.set(0, 16);
    }
})

const Timer = (function(){
    let dt = 0;
    
    return {
        'set': function(t) {
            dt = t / 1000;
        },
        
        'deltaTime': function() {
            return dt;
        }
    };
})();