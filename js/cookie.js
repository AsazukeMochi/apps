const Cookie = (function() {
    
    return {
        
        //cookieをセットする
        //key: cookieのキー
        //value: cookieの値
        //max_age:【省略可】cookieの期限を秒数で指定
        'Set': function(key, value, max_age) {
            let string = key + '=' + value;
            if (max_age) {
                string += ';max-age=' + max_age;
            }
            document.cookie = string;
        },
        
        //指定したkeyのcookieを取得する
        //取得できない時はnullを返却する
        'Get': function(key) {
            let arr = this.ToArray();
            for (let i = 0; i < arr.length; ++i) {
                if (arr[i].key === key) return arr[i].value;
            }
            return null;
        },
        
        //cookieを配列化して返却する
        'ToArray': function() {
            if (document.cookie === '') return [];
            
            let array = document.cookie.split('; ');
            let result = [];
            
            for (let i = 0; i < array.length; ++i) {
                let v = array[i].split('=');
                result.push({'key':v[0], 'value':v[1]});
            }
            
            return result;
        },
        
        //単位時間 Set()のmax_ageで使う
        'Minute': 60,
        'Hour': 60 * 60,
        'Day': 60 * 60 * 24,
        'Month': 60 * 60 * 24 * 30,
        'Year': 60 * 60 * 24 * 30 * 12
    }
    
})();