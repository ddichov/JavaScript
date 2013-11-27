(function (jQuery) {
    var z = 1; 
    var def_pos_x = 3;
    var def_pos_y = 3;
    var def_height = 162;
    var def_width = 160;
    var def_color = '#ffff00';
    var def_minimized_height = 50;
    var textarea_maxlength = 70;
    var input_maxlength = 16;
    var min_angle = -6;
    var max_angle = 3;
    var storage_key = "notes";

    jQuery.fn.stickyNotes = function (options) {
        var options = options || {};
        var stored_notes = jQuery.fn.stickyNotes.getState(storage_key) || [];
        if (options.notes === undefined || options.notes === null || options.notes.length === 0) {
            options.notes = stored_notes;
        }
        function comparer(a, b) {
            if (a.z < b.z)
                return -1;
            if (a.z > b.z)
                return 1;
            return 0;
        }
        options.notes.sort(comparer);

        jQuery.fn.stickyNotes.options = jQuery.extend({}, jQuery.fn.stickyNotes.defaults, options);
        jQuery.fn.stickyNotes.prepareContainer(this);
        jQuery.each(jQuery.fn.stickyNotes.options.notes,
            function (index, note) {
                note.z = z++;
                jQuery.fn.stickyNotes.renderNote(note);
                jQuery.fn.stickyNotes.notes.push(note);
        });
    };

    jQuery.fn.stickyNotes.prepareContainer = function (container) {
        jQuery(container).append('<div id="sticky-container" class="sticky-container"></div>');
        jQuery("#sticky-container").html('<button id="add_note_btn">Add Note</button>');
        jQuery("#add_note_btn").click(function () {
            jQuery.fn.stickyNotes.createNote();
            return false;
        });
        jQuery("#sticky-container").click(function () {
            var note_ids = jQuery.fn.stickyNotes.currentlyEditedNoteIds;
            for (var i = note_ids.length - 1; i >= 0; i--) {
                var note_id = note_ids[i]
                if (note_id != null) {
                    jQuery.fn.stickyNotes.editNoteStop(note_id);
                }
            };
        });
    };

    jQuery.fn.stickyNotes.renderNote = function (note) {
        var _note_height = note.height;
        var _note_class = 'medium';
        if (note.minimized === true) {
            _note_height = def_minimized_height;
            _note_class = 'small';
        }
        var _div_background = $(document.createElement('div'))
                                .addClass("background");
        var _div_note = jQuery(document.createElement('div'))
                            .addClass('sticky-note')
                            .click(function () {
                                return false;
                            });
        var _h_note_title = $(document.createElement('h2'))
                            .attr("id", "h-note-" + note.id)
                            .html(note.title)
                            .dblclick(function () {
                                jQuery.fn.stickyNotes.editNoteStart(this);
                            });
        var _p_note_text = $(document.createElement('p'))
                            .attr("id", "p-note-" + note.id)
                            .html(note.text)
                            .dblclick(function () {
                                jQuery.fn.stickyNotes.editNoteStart(this);
                            });
        _div_note.append(_h_note_title);
        _div_note.append(_p_note_text);

        var _div_wrap = $(document.createElement('div'))
                            .css({
                                'position': 'absolute',
                                'top': note.pos_y,
                                'left': note.pos_x,
                                'float': 'left',
                                'width': note.width,
                                'height': _note_height,
                                "background-color": note.color,
                                "z-index": note.z,
                            })
                            .attr("id", "note-" + note.id)
                            .append(_div_background)
                            .append(_div_note);
        _div_wrap.addClass(_note_class);
        if (jQuery.fn.stickyNotes.options.resizable) {
            _div_wrap.resizable({ stop: function (event, ui) { jQuery.fn.stickyNotes.resizedNote(note.id) } });
        }
        _div_wrap.draggable({
            containment: '#sticky-container',
            scroll: false,
            start: function (event, ui) {
                $(this).css("z-index", z++);
                jQuery.fn.stickyNotes.movedNoteStart(note.id);
            },
            stop: function (event, ui) {
                jQuery.fn.stickyNotes.movedNoteStop(note.id);
            }
        });
        jQuery.fn.stickyNotes.rotateNote(_div_wrap, note.angle, 1);
        if (jQuery.fn.stickyNotes.options.controls) {
            _div_wrap = jQuery.fn.stickyNotes.addCommandBar(_div_wrap, note.id);
        }
        jQuery('#sticky-container').append(_div_wrap);
        if (note.blank) {
            jQuery.fn.stickyNotes.animateNoteAppearance(note);
        }
    }

    jQuery.fn.stickyNotes.addCommandBar = function (el, note_id) {
        var _div_delete = $(document.createElement('div'))
                           .addClass('sticky-btn-delete')
                           .click(function () {
                               jQuery.fn.stickyNotes.deleteNote(this);
                           });
        var _div_max = $(document.createElement('div'))
                             .addClass('sticky-btn-max')
                             .click(function () {
                                 jQuery.fn.stickyNotes.maximizeNote(this);
                             });
        var _div_min = $(document.createElement('div'))
                            .addClass('sticky-btn-min')
                            .click(function () {
                                jQuery.fn.stickyNotes.minimizeNote(this);
                            });
        var _color = $(document.createElement('input'))
                            .attr("id", "input-color-" + note_id)
                            .attr("type", "color")
                            .addClass('sticky-btn-color')
                            .change(function () {
                                var color = $(this).val();
                                jQuery.fn.stickyNotes.changeColor(this, color);
                            });
        el.append(_div_delete)
            .append(_div_max)
            .append(_div_min)
            .append(_color);
        return el;
    }
  
    jQuery.fn.stickyNotes.animateNoteAppearance = function (note) {
        var rip = document.getElementById("rip");
        rip.play();
        rip.volume = .3;
        note.blank = false;
        jQuery("#note-" + note.id).css({
            "width": '65px',
            "height": '60px',
            "opacity": '0.7'
        });
        setTimeout(function () {
            jQuery("#note-" + note.id).animate({
                left: '80px',
                opacity: '0.95',
                height: note.height,
                width: note.width,
            }, 1000);
        }, 500);
        setTimeout(function () {
            note.pos_x = Math.round(jQuery("#note-" + note.id)
                            .css("left")
                            .replace(/px/, "")
                            );
            $("#h-note-" + note.id).dblclick();
        }, 2200);
    }

    jQuery.fn.stickyNotes.createNote = function () {
        var note_id = 1;
        if (jQuery.fn.stickyNotes.notes.length > 0) {
            note_id = jQuery.fn.stickyNotes.notes[jQuery.fn.stickyNotes.notes.length - 1].id + 1;
        }
        var angle = jQuery.fn.stickyNotes.getRandomAngle();
        var note = {
            "id": note_id,
            "text": "",
            "title": "",
            "pos_x": def_pos_x,
            "pos_y": def_pos_y,
            "width": def_width,
            "height": def_height,
            "minimized": false,
            "blank": true,
            "angle": angle,
            "color": def_color,
            "z": z++,
        };
        jQuery.fn.stickyNotes.notes.push(note);
        jQuery.fn.stickyNotes.renderNote(note);
        if (jQuery.fn.stickyNotes.options.saveState) {
            jQuery.fn.stickyNotes.saveState(storage_key);
        }
        if (jQuery.fn.stickyNotes.options.createCallback) {
            jQuery.fn.stickyNotes.options.createCallback(note);
        }
    }

    jQuery.fn.stickyNotes.getNote = function(note_id) {
        var result = null;
        jQuery.each(jQuery.fn.stickyNotes.notes, function(index, note) {
            if (note.id == note_id) {
                result = note;
                return false;
            }
        });
        return result;
    }
    
    jQuery.fn.stickyNotes.getNotes = function() {
        return jQuery.fn.stickyNotes.notes;
    }    

    jQuery.fn.stickyNotes.editNoteStart = function(paragraph) {
        var note_id = jQuery(paragraph).parent().parent().attr("id").replace(/note-/, "");
        var textarea = $(document.createElement('textarea'))
                            .attr("id", "textarea-note-" + note_id)
                            .attr("maxlength", textarea_maxlength)
                            .addClass('note-textarea')
                            .val(
                                    $("#note-" + note_id)
                                    .find('p')
                                    .text()
                                    );
        var input_val = "";
         input_val = $(document.createElement('input'))
                            .attr("id", "input-note-" + note_id)
                            .attr("maxlength", input_maxlength)
                            .addClass('note-input')
                            .val($("#h-note-" + note_id).html() );
        
        $("#p-note-" + note_id).replaceWith(textarea);
        $("#h-note-" + note_id).replaceWith(input_val); 

        jQuery(textarea).css({
            'width': jQuery("#note-" + note_id).width() - 25, 
            'height': jQuery("#note-" + note_id).height() - 45 
        });
        jQuery(input_val).css({
            'width': jQuery("#note-" + note_id).width() - 25,
            'height': 25, 
        });
        jQuery("#input-note-" + note_id).focus();
        jQuery.fn.stickyNotes.addToEditedNotesList(note_id);
    }

    jQuery.fn.stickyNotes.editNoteStop = function(note_id) {
        var note = jQuery.fn.stickyNotes.getNote(note_id);
        note.text = $("#textarea-note-" + note_id).val();
        note.title = $("#input-note-" + note_id).val();
        var _h_note_title = $(document.createElement('h2'))
                            .attr("id", "h-note-" + note.id)
                            .html(note.title)
                            .dblclick(function () {
                                jQuery.fn.stickyNotes.editNoteStart(this);
                            });
        var _p_note_text = $(document.createElement('p'))
                            .attr("id", "p-note-" + note_id)
                            .html(note.text)
                            .dblclick(function () {
                                jQuery.fn.stickyNotes.editNoteStart(this);
                            });
        $("#input-note-" + note_id).replaceWith(_h_note_title);
        $("#textarea-note-" + note_id).replaceWith(_p_note_text);
        jQuery.fn.stickyNotes.removeFromEditedNotesList(note_id);
        if (jQuery.fn.stickyNotes.options.saveState) {
            jQuery.fn.stickyNotes.saveState(storage_key);
        }
        if (jQuery.fn.stickyNotes.options.editCallback) {
            jQuery.fn.stickyNotes.options.editCallback(note);
        }
    };

    jQuery.fn.stickyNotes.deleteNote = function (button) {
        var div_wrap = jQuery(button).parent();
        var note_id = div_wrap.attr("id").replace(/note-/, "");
        document.getElementById("trash").play(); 
        jQuery("#note-" + note_id + ' .sticky-btn-min').click();
        jQuery.fn.stickyNotes.animateDeleteNote(div_wrap);
        jQuery.fn.stickyNotes.affectDeleteNote(note_id);
        if (jQuery.fn.stickyNotes.options.deleteCallback) {
            jQuery.fn.stickyNotes.options.deleteCallback(note);
        }
    }

    jQuery.fn.stickyNotes.animateDeleteNote = function (div_wrap) {
        div_wrap.animate({
            font: '0.03em',
            height: '60px',
            width: '60px',
            opacity: '0.8'
        },
               "slow");
        setTimeout(function () {
            div_wrap.animateRotate(0, 360, 1500, 'linear');
            div_wrap.animate({
                left: '-900px',
            }, 1500);
        }, 1500);
        setTimeout(function () { div_wrap.remove(); }, 3000);
    }

    jQuery.fn.stickyNotes.affectDeleteNote = function (note_id) {
        jQuery.each(jQuery.fn.stickyNotes.notes,
          function (index, current_note) {
              if (current_note.id == note_id) {
                  jQuery.fn.stickyNotes.notes.splice(index, 1);
                  return false;
              }
          });
        if (jQuery.fn.stickyNotes.options.saveState) {
            jQuery.fn.stickyNotes.saveState(storage_key);
        }
    }

    jQuery.fn.stickyNotes.minimizeNote = function (button) {
        var div_wrap = jQuery(button).parent();
        var note_id = div_wrap.attr("id").replace(/note-/, "");
        var note = jQuery.fn.stickyNotes.getNote(note_id);
        if (note.minimized === false) {
             document.getElementById("shrink").play();
        }
        note.minimized = true;
        div_wrap.removeClass('medium');
        div_wrap.addClass('small');
        div_wrap.animate({
            height: def_minimized_height,
        }, 1000);
        setTimeout(function () {
            div_wrap.css({
                "height": def_minimized_height,
            });
        }, 1200);
        if (jQuery.fn.stickyNotes.options.saveState) {
            jQuery.fn.stickyNotes.saveState(storage_key);
        }
        if (jQuery.fn.stickyNotes.options.minimizeCallback) {
            jQuery.fn.stickyNotes.options.minimizeCallback(note);
        }
    }

    jQuery.fn.stickyNotes.maximizeNote = function (button) {
        var div_wrap = jQuery(button).parent();
        var note_id = div_wrap.attr("id").replace(/note-/, "");
        var note = jQuery.fn.stickyNotes.getNote(note_id);
        if (note.minimized === true) {
            document.getElementById("shrink").play();
        }
        note.minimized = false;
        div_wrap.removeClass('small');
        div_wrap.addClass('medium');
        div_wrap.animate({
            height: note.height,
        }, 1000);
       
        setTimeout(function () {
            div_wrap.css({
                "height": note.height,
            });
        }, 1200);
        if (jQuery.fn.stickyNotes.options.saveState) {
            jQuery.fn.stickyNotes.saveState(storage_key);
        }
        if (jQuery.fn.stickyNotes.options.maximizeCallback) {
            jQuery.fn.stickyNotes.options.maximizeCallback(note);
        }
    }
    
    jQuery.fn.stickyNotes.movedNoteStart = function (note_id) {
        var rip = document.getElementById("rip");
        var note = jQuery.fn.stickyNotes.getNote(note_id);
        var div_wrap = jQuery("#note-" + note_id);
        rip.play();
        rip.volume = .3;
        document.getElementById("slide").play();
        div_wrap.addClass('moved');
        jQuery.fn.stickyNotes.rotateNote(div_wrap, note.angle, 1.1);
    }

    jQuery.fn.stickyNotes.movedNoteStop = function (note_id) {       
        var note = jQuery.fn.stickyNotes.getNote(note_id);
        var div_wrap = jQuery("#note-" + note_id);
        note.pos_x = Math.round(jQuery("#note-" + note_id).css("left").replace(/px/, ""));
        note.pos_y = Math.round(jQuery("#note-" + note_id).css("top").replace(/px/, ""));
        note.z = z - 1;
        div_wrap.removeClass('moved');
        jQuery.fn.stickyNotes.rotateNote(div_wrap, note.angle, 1);
        if (jQuery.fn.stickyNotes.options.saveState) {
            jQuery.fn.stickyNotes.saveState(storage_key);
        }
        if (jQuery.fn.stickyNotes.options.moveCallback) {
            jQuery.fn.stickyNotes.options.moveCallback(note);
        }        
    }

    jQuery.fn.stickyNotes.changeColor = function (button, color) {
        var div_wrap = jQuery(button).parent();
        var note_id = div_wrap.attr("id").replace(/note-/, "");
        var note = jQuery.fn.stickyNotes.getNote(note_id);
        note.color = color;
        div_wrap.css({
            "background-color": color,
        });
        if (jQuery.fn.stickyNotes.options.saveState) {
            jQuery.fn.stickyNotes.saveState(storage_key);
        }
        if (jQuery.fn.stickyNotes.options.changeColorCallback) {
            jQuery.fn.stickyNotes.options.changeColorCallback(note);
        }
    }

    jQuery.fn.stickyNotes.resizedNote = function(note_id) {
        var note = jQuery.fn.stickyNotes.getNote(note_id);
        note.width=jQuery("#note-" + note_id).width();
        note.height = jQuery("#note-" + note_id).height();
        if (jQuery.fn.stickyNotes.options.saveState) {
            jQuery.fn.stickyNotes.saveState(storage_key);
        }
        if (jQuery.fn.stickyNotes.options.resizeCallback) {
            jQuery.fn.stickyNotes.options.resizeCallback(note);
        }        
    }

    jQuery.fn.stickyNotes.rotateNote = function (el, angle, scale) {
        var scale = scale || 1;
        var angle = angle || 0;
        el.css({
            '-webkit-transform': 'rotate(' + angle + 'deg) scale(' + scale + ')',
            '-moz-transform': 'rotate(' + angle + 'deg) scale(' + scale + ')',
            '-o-transform': 'rotate(' + angle + 'deg) scale(' + scale + ')',
            '-ms-transform': 'rotate(' + angle + 'deg) scale(' + scale + ')',
            'transform': 'rotate(' + angle + 'deg) scale(' + scale + ')',
        });
        return el;
    }

    jQuery.fn.animateRotate = function (startAngle, endAngle, duration, easing, complete) {
        return this.each(function () {
            var elem = $(this);
            $({ deg: startAngle }).animate({ deg: endAngle }, {
                duration: duration,
                easing: easing,
                step: function (now) {
                    elem.css({
                        '-moz-transform': 'rotate(' + now + 'deg)',
                        '-webkit-transform': 'rotate(' + now + 'deg)',
                        '-o-transform': 'rotate(' + now + 'deg)',
                        '-ms-transform': 'rotate(' + now + 'deg)',
                        'transform': 'rotate(' + now + 'deg)',
                    });
                },
                complete: complete || $.noop
            });
        });
    };
    
    jQuery.fn.stickyNotes.saveState = function (key) {
        if (jQuery.fn.stickyNotes.notes.length === 0) {
            localStorage.removeItem(key);
        } else {
            var jsonObj = JSON.stringify(jQuery.fn.stickyNotes.notes);
            localStorage.setItem(key, jsonObj);
        }
        return this;
    }

    jQuery.fn.stickyNotes.getState = function (key) {
        var jsonObj = localStorage.getItem(key);
        var obj = JSON.parse(jsonObj);
        return obj;
    }

    jQuery.fn.stickyNotes.getRandomAngle = function () {

        return Math.floor(Math.random() * (max_angle - min_angle + 1)) + min_angle;
    }

    jQuery.fn.stickyNotes.addToEditedNotesList = function (note_id) {
        jQuery.fn.stickyNotes.currentlyEditedNoteIds.push(note_id);
    }    
    
    jQuery.fn.stickyNotes.removeFromEditedNotesList = function (note_id) {
        var note_ids = jQuery.fn.stickyNotes.currentlyEditedNoteIds; 
        var pos = -1;
        for (var i = note_ids.length - 1; i >= 0; i--) {
            if (note_ids[i] == note_id) {
                pos = i;
                break;
            }
        };
        jQuery.fn.stickyNotes.currentlyEditedNoteIds.splice(pos, 1);
    }

    jQuery.fn.stickyNotes.defaults = {
        notes     : [],
        resizable : true,
        controls: true,
        saveState: true,
        editCallback: false, 
        createCallback: false,
        deleteCallback: false,
        moveCallback: false,
        resizeCallback: false,
        changeColorCallback: false,
        minimizeCallback: false,
        maximizeCallback: false,
    };
    
    jQuery.fn.stickyNotes.options = null;
    jQuery.fn.stickyNotes.currentlyEditedNoteIds = new Array();
    jQuery.fn.stickyNotes.notes = new Array();

})(jQuery);
