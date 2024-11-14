//https://qiita.com/Negiwine_jp/items/2fb5258f42a8a401c126
phina.define('PixelSprite', {
  superClass: 'Sprite',

  init: function(image, width, height){
    this.superInit(image, width, height);
  },
    
    
    _calcWorldMatrix: function() {
         if (!this.parent) return ;

          // cache check
          if (this.rotation != this._cachedRotation) {
            this._cachedRotation = this.rotation;

            var r = this.rotation*(Math.PI/180);
            this._sr = Math.sin(r);
            this._cr = Math.cos(r);
          }

          var local = this._matrix;
          var parent = this.parent._worldMatrix || phina.geom.Matrix33.IDENTITY;
          var world = this._worldMatrix;

          // ローカルの行列を計算
          local.m00 = this._cr * this.scale.x;
          local.m01 =-this._sr * this.scale.y;
          local.m10 = this._sr * this.scale.x;
          local.m11 = this._cr * this.scale.y;
          local.m02 = Math.floor(this.position.x);
          local.m12 = Math.floor(this.position.y);

          // cache
          var a00 = local.m00; var a01 = local.m01; var a02 = local.m02;
          var a10 = local.m10; var a11 = local.m11; var a12 = local.m12;
          var b00 = parent.m00; var b01 = parent.m01; var b02 = parent.m02;
          var b10 = parent.m10; var b11 = parent.m11; var b12 = parent.m12;

          // 親の行列と掛け合わせる
          world.m00 = b00 * a00 + b01 * a10;
          world.m01 = b00 * a01 + b01 * a11;
          world.m02 = b00 * a02 + b01 * a12 + b02;

          world.m10 = b10 * a00 + b11 * a10;
          world.m11 = b10 * a01 + b11 * a11;
          world.m12 = b10 * a02 + b11 * a12 + b12;

          return this;        
    },
    
  draw: function(canvas){
      
    canvas.save();                        //canvasの状態をスタックに保存
    canvas.imageSmoothingEnabled = false; //拡大時の補完を無効にする

    this.superMethod('draw', canvas);     //Spriteのdrawメソッド呼び出し

    canvas.restore();                     //他に影響が出ないように状態を戻す
      
  },
});

phina.define('PixelSpriteButton', {
    'superClass': 'DisplayElement',
    'init': function(src, text) {
        this.superInit();
        
        this.body = PixelSprite(src).addChildTo(this);
        this.body.scale.set(PIXEL_SCALE, PIXEL_SCALE);
        
        if (text) {
            this.label = CommonLabel({
                'text': text,
            }).addChildTo(this);
        }
        
        this.darker = PixelSprite(PixelSpriteButton.MaskTexture(src, '#888888')).addChildTo(this);
        this.darker.scale.set(PIXEL_SCALE, PIXEL_SCALE);
        this.darker.blendMode = 'multiply';
        this.darker.hide();
        
        this.width = this.body.width * PIXEL_SCALE;
        this.height = this.body.height * PIXEL_SCALE;
        this.setInteractive(true);
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
    
    //onPushedを上書きして使う
    'onPushed': function(){},
    
    '_static': {
        
        //[phina.js] 画像の色を変える方法(マスク) - Qiita
        //https://qiita.com/simiraaaa/items/2a1cc7b0f92718d6eed6
        'MaskTexture': function(src, color) {
            var original = AssetManager.get('image', src).domElement;

            // 画像生成用にダミーのシーン生成
            var dummy = DisplayScene({
                // 元画像と同じサイズにする
                width: original.width,
                height: original.height,
                // 背景色を変更したい色にする
                backgroundColor: color,
            });

            var originalSprite = Sprite(src).addChildTo(dummy);

            // 描画の位置を変更
            originalSprite.setOrigin(0, 0);
            // 描画方法をマスクするように変更
            originalSprite.blendMode = 'destination-in';

            // シーンの内容を描画
            dummy._render();

            // シーンの描画内容から テクスチャを作成
            var texture = Texture();
            texture.domElement = dummy.canvas.domElement;
            return texture;            
        }
        
    }
    
})
