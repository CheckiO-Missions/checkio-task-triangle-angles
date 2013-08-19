//Dont change it
requirejs(['ext_editor_1', 'jquery_190', 'raphael_210'],
    function (ext, $, TableComponent) {

        var cur_slide = {};

        ext.set_start_game(function (this_e) {
        });

        ext.set_process_in(function (this_e, data) {
            cur_slide["in"] = data[0];
        });

        ext.set_process_out(function (this_e, data) {
            cur_slide["out"] = data[0];
        });

        ext.set_process_ext(function (this_e, data) {
            cur_slide.ext = data;
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_process_err(function (this_e, data) {
            cur_slide['error'] = data[0];
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_animate_success_slide(function (this_e, options) {
            var $h = $(this_e.setHtmlSlide('<div class="animation-success"><div></div></div>'));
            this_e.setAnimationHeight(112);
        });

        ext.set_animate_slide(function (this_e, data, options) {
            var $content = $(this_e.setHtmlSlide(ext.get_template('animation'))).find('.animation-content');
            if (!data) {
                console.log("data is undefined");
                return false;
            }
            if (data.error) {
                $content.find('.call').html('Fail: checkio(' + ext.JSON.encode(data.in) + ')');
                $content.find('.output').html(data.error.replace(/\n/g, ","));

                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
                $content.find('.answer').remove();
                $content.find('.explanation').remove();
                this_e.setAnimationHeight($content.height() + 60);
                return false;
            }

            var checkioInput = data.in;
            var rightResult = data.ext["answer"];
            var userResult = data.out;
            var result = data.ext["result"];
            var result_addon = data.ext["result_addon"];


            //if you need additional info from tests (if exists)
            var explanation = data.ext["explanation"];

            $content.find('.output').html('&nbsp;Your result:&nbsp;' + ext.JSON.encode(userResult));

            if (!result) {
                $content.find('.call').html('Fail: checkio(' + ext.JSON.encode(checkioInput) + ')');
                $content.find('.answer').html('Right result:&nbsp;' + ext.JSON.encode(rightResult));
                $content.find('.answer').addClass('error');
                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
            }
            else {
                $content.find('.call').html('Pass: checkio(' + ext.JSON.encode(checkioInput) + ')');
                $content.find('.answer').remove();
            }
            if (String(rightResult) !== "0,0,0") {
                var canvas = new TriangleAnglesCanvas();
                canvas.createCanvas($content.find(".explanation")[0], checkioInput);
            }

            this_e.setAnimationHeight($content.height() + 63);

        });

        //TRYIT code
        var $tryit;


        //this function process returned data and show it
        ext.set_console_process_ret(function (this_e, ret) {
            try {
                ret = JSON.parse(ret);
            }
            catch(err){}

            $tryit.find(".checkio-result-in").html(ext.JSON.encode(ret));
        });

        ext.set_generate_animation_panel(function (this_e) {
            $tryit = $(this_e.setHtmlTryIt(ext.get_template('tryit'))).find(".tryit-content");

            //run checking
            $tryit.find('.bn-check').click(function (e) {
                //collect data from your tryit panel
                var sideA = parseInt($tryit.find(".input-a").val());
                var sideB = parseInt($tryit.find(".input-b").val());
                var sideC = parseInt($tryit.find(".input-c").val());

                if (isNaN(sideA)){
                    sideA = 3;
                }
                if (isNaN(sideB)){
                    sideB = 4;
                }
                if (isNaN(sideC)){
                    sideC = 5;
                }
                $tryit.find(".input-a").val(sideA);
                $tryit.find(".input-b").val(sideB);
                $tryit.find(".input-c").val(sideC);

                //send it for check
                this_e.sendToConsoleCheckiO([sideA, sideB, sideC]);
                //After it will be called set_console_process_ret
                e.stopPropagation();
                return false;
            });

        });

        var colorOrange4 = "#F0801A";
        var colorOrange3 = "#FA8F00";
        var colorOrange2 = "#FAA600";
        var colorOrange1 = "#FABA00";

        var colorBlue4 = "#294270";
        var colorBlue3 = "#006CA9";
        var colorBlue2 = "#65A1CF";
        var colorBlue1 = "#8FC7ED";

        var colorGrey4 = "#737370";
        var colorGrey3 = "#D9E9E";
        var colorGrey2 = "#C5C6C6";
        var colorGrey1 = "#EBEDED";

        var colorWhite = "#FFFFFF";


        function TriangleAnglesCanvas() {
            var x0 = 10;
            var y0 = 10;
            var fontSize = 16;
            var max_units = 200;
            var sizeX = max_units + 2 * x0;
            var sizeY;

            var attrLine = {"stroke": colorBlue4, "stroke-width": 4};
            var attrText = {"stroke": colorBlue4, "font-size": fontSize, "font-family": "Verdana"};
            var paper;

            this.createCanvas = function(dom, sides) {
                sides = sides.sort(function(a,b){return b-a});
                var unit = max_units / sides[0];
                var middle_point = sides[1] * (Math.pow(sides[0], 2) + Math.pow(sides[1], 2) - Math.pow(sides[2], 2)) / (2 * sides[0] * sides[1]);
                var height = Math.sqrt(Math.pow(sides[1], 2) - Math.pow(middle_point, 2));
                sizeY = 2 * y0 + fontSize + height * unit;
                paper = Raphael(dom, sizeX, sizeY, 0, 0);
                paper.path(Raphael.format(
                    "M{0},{1}H{2}L{3},{4}L{0},{1}Z",
                    x0,
                    sizeY - y0 - fontSize,
                    x0 + sides[0] * unit,
                    x0 + middle_point * unit,
                    sizeY - y0 - fontSize - height * unit
                )).attr(attrLine);
                paper.text(
                    x0 + unit * sides[0] / 2,
                    sizeY - y0,
                    sides[0]).attr(attrText);
                paper.text(
                    -x0 + unit * middle_point / 2,
                    sizeY - y0 - fontSize * 2 - unit * height / 2,
                    sides[1]).attr(attrText);
                paper.text(
                    2.5 * x0 + unit * (sides[0] / 2 + middle_point / 2),
                    sizeY - y0 - fontSize * 2 - unit * height / 2,
                    sides[2]).attr(attrText);



            }

        }


    }
);
