
//navigator.userAgentでユーザーの動作環境を確認するクラス
const UserAgent = (function(){
    
    return {
        
        //動作環境確認
        'Check': function() {
            if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
                return this.iOS;
            } else if (navigator.userAgent.match(/Android/i)) {
                return this.Android;
            } else {
                return this.PC;
            }
        },
        
        //引数の動作環境かどうか判定
        'Is': function(ua) {
            return this.Judge() === ua;
        },
        
        'PC':0,
        'Android':1,
        'iOS':2
    }
    
})();


//Twitterシェア用クラス
const Twitter = (function(){
    
    function PC() {
        return {
            'Profile': function(user) {
                //window.open('https://twitter.com/' + user, '_blank');
                location.href = 'https://twitter.com/' + user;
            },
            
            'Share': function(text, hash_tags, url) {
                let string = 'https://twitter.com/intent/tweet?text=' + text;
                if (hash_tags) {
                    let tags = hash_tags.join(',');
                    string += '&hashtags=' + tags;
                }
                if (url) {
                    string += '&url=' + url;
                }
                location.href = string;
            }
        }
    }
    
    function iOS() {
        return {
            'Profile': function(user) {
                location.href = 'twitter://user?screen_name=' + user;
            },
            
            'Share': function(text, hash_tags, url){
                let string = 'twitter://post?message=' + text;
                
                if (hash_tags) {
                    for (let i = 0; i < hash_tags.length; ++i) {
                        string += encodeURIComponent('#' + hash_tags[i] + ' ');
                    }
                }
                
                if (url) {
                    string += url;
                }
                
                location.href = string;
            }
        }
    }
    
    function Android() {
        return {
            'Profile': function(user) {
                location.href = 'twitter://user?screen_name=' + user;
            },
            
            'Share': function(text, hash_tags, url){
                let string = 'twitter://post?message=' + text;
                
                if (hash_tags) {
                    for (let i = 0; i < hash_tags.length; ++i) {
                        string += encodeURIComponent('#' + hash_tags[i] + ' ');
                    }
                }
                
                if (url) {
                    string += url;
                }
                
                location.href = string;
            }
        }
    }
    
    let _controller = (function(){
        switch (UserAgent.Check()) {
            case UserAgent.iOS: return iOS();
            case UserAgent.Android: return Android();
            case UserAgent.PC: return PC();
        }
    })();
    
    let _user = null;
    let _hashTags = null;
    let _url = null;
    
    return {
        
        'Profile': function() {
            if (_user === null) return;
            _controller.Profile(_user);
        },
        
        'Share': function(text) {
            _controller.Share(
                text,
                _hashTags,
                _url
            );
        },
        
        'SetUser': function(user) {
            _user = user;
        },
        
        'SetHashTags': function(hashTags) {
            _hashTags = hashTags;
        },
        
        'SetUrl': function(url) {
            _url = url;
        }
        
    }
    
})();
