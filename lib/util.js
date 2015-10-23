/**
 * Created by 17173 on 2015/4/9.
 */
var util = module.exports = {
    existElement: function(target, objects){
        var ret = false;
        if(objects instanceof Array){
            for(var i = 0, len=objects.length; i<len;i++){
                if(objects[i] == target) {
                    ret = true;
                    break;
                }
            }
        }else{
            if(objects[target]){
                ret = true;
            }
        }
        return ret;
    },
    isPart:function(target, arr){
        var ret = false;
        for(var i = 0, len=arr.length; i<len;i++){
            if(!target.indexOf(arr[i])) {
                ret = true;
                break;
            }
        }
        return ret;
    }
};