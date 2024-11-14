//GoogleAnalitics管理用クラス
const GA = (function() {
    
    let _events = {};
    
//    gtag('event', '<action>', {
//      'event_category': '<category>',
//      'event_label': '<label>',
//      'value': '<value>'
//    });
        
    return {
        
        //イベントを送信
        'SendEvent': function(action, value) {
            if (!window.gtag) return; //GAないなら処理しない
            if (!_events[action]) return; //未登録のactionなら処理しない
            
            //eventそのまま使えないので複製
            let event = JSON.parse(JSON.stringify(_events[action]));
            
            //value登録
            if (value) {
                Object.assign(event.params, {'value':value});
            }
            
            //console.log(event);
            gtag('event', event.action, event.params);
            
        },
        
        //イベントを登録
        'AddEvent': function(action, category, label) {
            if (_events[action]) return;
            
            let event = {
                'action': action,
                'params': {}
            };
            
            if (category) {
                event.params['event_category'] = category;
            }
            
            if (label) {
                event.params['event_label'] = label;
            }
            
            _events[action] = event;
        },
        
    }
    
})();