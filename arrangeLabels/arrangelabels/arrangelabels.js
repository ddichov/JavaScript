(function (jQuery) {
    var z = 1, _counter = 0, _labels = [], def = {}, _scale={}; 
    def.pos_x = 3;
    def.pos_y = 150;
    def.height = 208;
    def.width = 150;
    _scale.start_val = 0;   
    _scale.end_val = 10;  
    _scale.start_X = def.width;
    _scale.end_X = 480;         //px  
    _scale.factor = 46;         //px
    
    jQuery.fn.arrangeLabels = function (options) {
        var options = options || {};
        
        if (options.labels === undefined || options.labels === null || options.labels.length === 0) {
            throw "ERROR: Missing data << options.labels >>!";
            return false;
        }
        
        jQuery.fn.arrangeLabels.options = jQuery.extend({}, jQuery.fn.arrangeLabels.defaults, options);
        jQuery.fn.arrangeLabels.prepareContainer(this);
        jQuery.fn.arrangeLabels.calcDimentions(this);
        jQuery.fn.arrangeLabels.prepareLabels();
        jQuery.fn.arrangeLabels.shuffleLabels();
 
        jQuery.each(_labels,
            function (index, label) {
                label.z = z++;
                jQuery.fn.arrangeLabels.renderLabel(label);
        });
    };

    jQuery.fn.arrangeLabels.prepareContainer = function (container) {
        jQuery(container).html('<div id="sticky-container" class="sticky-container"><div id="scale"></div></div>');

        ////EVENTS
        jQuery("#" + jQuery.fn.arrangeLabels.options.next_button_id).click( jQuery.fn.arrangeLabels.onComplete );
        jQuery(window).resize( function(ev){
            jQuery.fn.arrangeLabels.calcDimentions(container);
        } );
    };
    
    jQuery.fn.arrangeLabels.calcDimentions = function(container){

        var stiky_container = jQuery("#sticky-container");
        var scale = jQuery("#scale");
        var h_line = jQuery("<hr/>");
        var range = 0, i = 0 , j = 0;
        var div = jQuery("<div></div>").css({
            'position': 'absolute',
            '-moz-box-sizing': 'border-box',
            '-webkit-box-sizing': 'border-box',
            'box-sizing': 'border-box',
            'height': 10 + 'px',
        });
        scale.html("");
        scale.append(h_line);
        
        _scale.end_X = stiky_container.css("width").replace(/px/, "") - _scale.start_X;
        
        if (jQuery.fn.arrangeLabels.options.scale_min <= jQuery.fn.arrangeLabels.options.scale_max){
            _scale.start_val = jQuery.fn.arrangeLabels.options.scale_min;
            _scale.end_val = jQuery.fn.arrangeLabels.options.scale_max;
        }else{
            _scale.start_val = jQuery.fn.arrangeLabels.options.scale_max;
            _scale.end_val = jQuery.fn.arrangeLabels.options.scale_min;
        }
        _scale_step = parseInt(jQuery.fn.arrangeLabels.options.scale_step);
        range = _scale.end_val - _scale.start_val;
        if (range % _scale_step !== 0 ){
            // alert("ERROR: arrangeLabels Step is not applicable to the scale!");
            throw "ERROR: Step is not applicable to the scale!";
            return false;
        }
        
        // // => px available / count( scale_values ); e.g. 1 value = ?px
        _scale.factor = Math.floor((_scale.end_X - _scale.start_X) / ((_scale.end_val - _scale.start_val + 1) / _scale_step + 1));
        while(_scale.factor === 0){
            _scale_step *= 2;
            _scale.factor = Math.floor((_scale.end_X - _scale.start_X) / ((_scale.end_val - _scale.start_val + 1) / _scale_step + 1));
        }

        if(_scale.factor >= 25){
            for( i =_scale.start_val, j = 0; i<= _scale.end_val; i+=_scale_step ) {
                 scale.append( 
                    div.clone().text(i).css({'left': j * _scale.factor + 'px' })
                    .append( div.clone().css({ 'border-left': '1px solid black'}))
                );
                j += 1;
            }
            _scale.width = Math.floor((j-1) * _scale.factor);
            
        }else if(_scale.factor >= 8){
            var c2_step =_scale_step;
            var c2_multipl = 1;
            if(range%(_scale_step*5) === 0){
                c2_multipl = 5;
            }else if(range%(_scale_step*4) === 0){
                c2_multipl = 4;
            }else if(range%(_scale_step*3) === 0){
                c2_multipl = 3;
            }else {
                c2_multipl = 2;
            }
            if(_scale.factor * c2_multipl < 40){
            c2_multipl *= 2;
            }
            c2_step = _scale_step*c2_multipl;
            for( i =_scale.start_val, j = 0; i <= _scale.end_val; i += c2_step ) {
                 scale.append( 
                    div.clone().text(i).css({'left': j * _scale.factor * c2_multipl + 'px' })
                    .append( div.clone().css({ 'border-left': '1px solid black'}))
                );
                j += 1;
            }
             _scale.width = Math.floor( (j-1 + (_scale.end_val - (i - c2_step))/c2_step) * _scale.factor * c2_multipl );
           
        }else {
            var c3_step = _scale_step;
            var c3_multipl = 6;
            
            if(range%(_scale_step*10) === 0){
                c3_multipl = 10;
            }else if(range%(_scale_step*9) === 0){
                c3_multipl = 9;
            }else if(range%(_scale_step*8) === 0){
                c3_multipl = 8;
            }else if(range%(_scale_step*7) === 0){
                c3_multipl = 7;
            }
            
            if(((_scale.end_val - _scale.start_val + 1) / _scale_step + 1) >100){
                c3_multipl *= 10;
            }
            c3_step =_scale_step*c3_multipl;

            for( i = _scale.start_val, j = 0; i <= _scale.end_val; i += c3_step ) {
                scale.append( 
                    div.clone().text(i).css({'left': j * _scale.factor * c3_multipl + 'px' })
                    .append( div.clone().css({ 'border-left': '1px solid black'}))
                );
                j += 1;
            } 

            _scale.width = Math.floor( (j-1 + (_scale.end_val - (i - c3_step))/c3_step) * _scale.factor * c3_multipl ); 
        }
        
        scale.css({
            'position': 'relative',
            '-moz-box-sizing': 'border-box',
            '-webkit-box-sizing': 'border-box',
            'box-sizing': 'border-box',
            'width': (_scale.end_X - _scale.start_X),
            'height': 40 + 'px',
            'margin': '0 auto',
            "background-color": '#f1f1f1',
        });
        
        h_line.css({
            'position': 'absolute',
            '-moz-box-sizing': 'border-box',
            '-webkit-box-sizing': 'border-box',
            'box-sizing': 'border-box',
            'width': (_scale.width + 2) + "px",
            'height': 10 + 'px',
            'margin': '0 auto',
            'background-color': 'gray',
            'bottom': '0',
        });
        
        jQuery.each(_labels, function (index, label) {
            if(!(label.value === null || label.value === undefined)){
                var div_wrap = jQuery("#label-" + label.id);
                label.pos_x   = ((label.value -_scale.start_val)/_scale_step)*_scale.factor - (def.width/2) + _scale.start_X   ;
                div_wrap.css("left", label.pos_x + "px" );
            }
        });   
    }
    
    jQuery.fn.arrangeLabels.prepareLabels = function() {
        var labels = jQuery.fn.arrangeLabels.options.labels;
        for ( var i = labels.length - 1; i >= 0; i-- ) {
            if (labels[i] !== "") {
                var label = {
                    text: labels[i],
                    id: i,
                    "pos_x": def.pos_x,
                    "pos_y": def.pos_y,
                    "width": def.width,
                    "height": def.height,
                }
                _labels.push(label);
            }
        };
        return _labels;
    }
    
    jQuery.fn.arrangeLabels.shuffleLabels = function() {
        if (jQuery.fn.arrangeLabels.options.shuffle && _labels.length > 1) {
            for ( var j, x, i = _labels.length - 1; i >= 0; i-- ) {
                j = Math.floor(Math.random() * i);
                x = _labels[i];
                _labels[i] = _labels[j];
                _labels[j] = x;
            };
        }
        return _labels;
    }
    
    jQuery.fn.arrangeLabels.renderLabel = function (label) {
        var _label_height = label.height;
        var _label_class = 'medium';
        
        if (jQuery.fn.arrangeLabels.options.labelCustomClass !== '') {
            _label_class = 'medium '+ jQuery.fn.arrangeLabels.options.labelCustomClass;
        }
        var _div_background = $(document.createElement('div'))
                                .addClass("background");
        var _div_label = jQuery(document.createElement('div'))
                            .addClass('sticky-label')
                            .click(function () {
                                return false;
                            });
        var _h_label_title = $(document.createElement('h2'))
                            .attr("id", "h-label-" + label.id);

        var _p_label_text = $(document.createElement('p'))
                            .attr("id", "p-label-" + label.id)
                            .html(label.text);
        _div_label.append(_h_label_title);
        _div_label.append(_p_label_text);

        var _div_wrap = $(document.createElement('div'))
                            .css({
                                'position': 'absolute',
                                'top': label.pos_y,
                                'left': label.pos_x,
                                'float': 'left',
                                'width': label.width,
                                'height': _label_height,
                                "z-index": label.z,
                            })
                            .attr("id", "label-" + label.id)
                            .append(_div_background)
                            .append(_div_label);
                            
        _div_wrap.addClass(_label_class);
        
        _div_wrap.draggable({
            containment: '#sticky-container',
            scroll: false,
            start: function (event, ui) {
                $(this).css("z-index", z++);
                jQuery.fn.arrangeLabels.moveLabelStart(label.id);
            },
            stop: function (event, ui) {
                jQuery.fn.arrangeLabels.moveLabelStop(label.id);
            }
        });
        
        jQuery('#sticky-container').append(_div_wrap);
    }
    
    jQuery.fn.arrangeLabels.getLabel = function(label_id) {
        var result = null;
        jQuery.each(_labels, function(index, el) {
            if (el.id == label_id) {
                result = el;
                return false;
            }
        });
        return result;
    }
    
    jQuery.fn.arrangeLabels.getLabels = function() {
        return jQuery.fn.stickyNotes.labels;
    }
    
    jQuery.fn.arrangeLabels.moveLabelStart = function (label_id) {
        var label = jQuery.fn.arrangeLabels.getLabel(label_id);
        var div_wrap = jQuery("#label-" + label_id);
        div_wrap.addClass('moved');
    }

    jQuery.fn.arrangeLabels.moveLabelStop = function (label_id) {       
        var label = jQuery.fn.arrangeLabels.getLabel(label_id);
        var div_wrap = jQuery("#label-" + label_id);
        label.pos_x = Math.round(div_wrap.css("left").replace(/px/, ""));
        label.pos_y = Math.round(div_wrap.css("top").replace(/px/, ""));
        label.z = z - 1;
        div_wrap.removeClass('moved');
        
        
        if( (label.pos_x + (def.width/2)) >= _scale.start_X && (label.pos_x + (def.width/2)) <= _scale.end_X && label.pos_y < 100){
            if(label.value === null || label.value === undefined){
                _counter++; // New Answer
            }
            label.pos_y = 25;
            // label.value = parseInt((label.pos_x + (def.width/2) - _scale.start_X ) / _scale.factor )*_scale_step + _scale.start_val; 
            label.value = Math.floor((label.pos_x + (def.width/2) - _scale.start_X ) / _scale.factor )*_scale_step + _scale.start_val; 
            
            if(label.value >= _scale.start_val && label.value <= _scale.end_val){
                div_wrap.css("top", label.pos_y + 'px');
                jQuery('h2', div_wrap).text(label.value);
            }else{
                jQuery.fn.arrangeLabels.reset(label, div_wrap);
            }
            
        }else{
            jQuery.fn.arrangeLabels.reset(label, div_wrap);
        }
        
        if (jQuery.fn.arrangeLabels.options.moveCallback) {
            jQuery.fn.arrangeLabels.options.moveCallback(label);
        }        
    }
    
    jQuery.fn.arrangeLabels.reset = function (label, div_wrap) {
        if(label.value !== null && label.value !== undefined){
            label.value = null;
            _counter--;
            if(_counter < 0){
                _counter = 0
            }
        }
        label.pos_x = def.pos_x,
        label.pos_y = def.pos_y,
        jQuery('h2', div_wrap).text('');
        div_wrap.css("top", label.pos_y + 'px');
        div_wrap.css("left", label.pos_x + 'px');
    }
    
    jQuery.fn.arrangeLabels.onComplete = function () {
        if (_labels.length === _counter){
            var answers = [];
            function comparer(a, b) {
                if (a.id < b.id)
                    return -1;
                if (a.id > b.id)
                    return 1;
                return 0;
            }
            
            _labels.sort(comparer);
            
            for ( var i = 0; i < _labels.length; i += 1 ) {
                answers.push(_labels[i]['value']);
            };

            if (jQuery.fn.arrangeLabels.options.onCompleteCallback) {
                jQuery.fn.arrangeLabels.options.onCompleteCallback(answers);
            }
            return answers;
        }
    }

    jQuery.fn.arrangeLabels.defaults = {
        labels: [],
        shuffle: true,
        labelCustomClass: '',
        scale_min: 0,
        scale_max: 10,
        scale_step: 1,
        next_button_id: 'forwardbutton',
        onCompleteCallback: false,
        moveCallback: false,
    };
    
    jQuery.fn.arrangeLabels.options = null;
    // jQuery.fn.arrangeLabels.labels = new Array();

})(jQuery);
