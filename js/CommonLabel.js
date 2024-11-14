phina.define('CommonLabel', {
    'superClass': 'Label',
    'init': function(params) {
        
        if (typeof params !== 'object') {
            params = {'text':params};
        }
        
        params.$safe({
            'fontFamily': 'PixelMplus',
            'fontSize': 10 * PIXEL_SCALE,
            'fill': '#fff',
            'stroke': '#444',
            'strokeWidth': 2 * PIXEL_SCALE
        });
        
        this.superInit(params);
    }
})

phina.define('CommonLabelButton', {
    'superClass': 'DisplayElement',
    'init': function(params) {
        this.superInit();
        this.setInteractive(true);
        
        params = params || {};
        
        this.label = CommonLabel(params).addChildTo(this);
        
        params.$extend({
            'fill':'#888',
            'stroke':'#888'
        });
        this.darker = CommonLabel(params).addChildTo(this);
        this.darker.blendMode = 'multiply';
        this.darker.hide();
        
    },
    
    'onpointstart': function(e) {
        this.darker.show();
    },
    
    'onpointend': function(e) {
        this.darker.hide();
        if (this.hitTest(e.pointer.x, e.pointer.y)) {
            this.onPushed();
        }
    },
    
    'showHitRect': function() {
        RectangleShape({
            'width':this.width,
            'height':this.height,
            'fill':null,
            'stroke':'#ff0000'
        }).addChildTo(this);
    },
    
    'onPushed': function(){} //onPushedを拡張して使う
})