phina.define('LoadingScene', {
    'superClass': 'phina.game.LoadingScene',
    'init': function(params) {
        this.superInit(params);
        
        this.backgroundColor = '#444';
        
        this.gauge.gaugeColor = '#fff';
        //this.gauge.y = CANVAS_HEIGHT / 2 - (32 * PIXEL_SCALE);
        //this.gauge.width = CANVAS_WIDTH / 2;
        //this.gauge.height = 8 * PIXEL_SCALE;
        
    }
})