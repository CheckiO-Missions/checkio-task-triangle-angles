requirejs(['ext_editor_io', 'jquery_190', 'raphael_210'],
    function (extIO, $, TableComponent) {
        function TriangleAnglesCanvas() {
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
            var x0 = 10;
            var y0 = 10;
            var fontSize = 16;
            var max_units = 200;
            var sizeX = max_units + 2 * x0;
            var sizeY;

            var attrLine = {"stroke": colorBlue4, "stroke-width": 4};
            var attrText = {"stroke": colorBlue4, "font-size": fontSize, "font-family": "Verdana"};
            var paper;

            this.createCanvas = function (dom, in_sides) {
                var sides = in_sides.slice();
                sides = sides.sort(function (a, b) {
                    return b - a
                });
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


            };

            var attrBackLines = {"stroke": colorBlue1, "stroke-width": 1, "stroke-dasharray": "- "};
            var attrEdge = {"stroke": colorBlue3, "stroke-width": 4, "stroke-linecap": "round"};
            var attrPoint = {"stroke": colorBlue4, "stroke-width": 3, "fill": colorBlue4, "cursor": "pointer"};
            var attrNumb = {"stroke": colorBlue4, "font-size": 25, "font-family": "Verdana"};

            this.createFeedbackCanvas = function (dom, this_e) {
                sizeX = 360;
                sizeY = 180;
                paper = Raphael(dom, sizeX, sizeY);

                var ax = 60,
                    ay = 150,
                    bx = 240,
                    by = 150,
                    cx = 150,
                    cy = 30;

                for (var h = 15; h < sizeY; h += 15) {
                    paper.path("M0," + h + "H" + (sizeX - 60)).attr(attrBackLines);
                }
                for (var v = 15; v < sizeX - 60; v += 15) {
                    paper.path("M" + v + ",0V" + sizeY).attr(attrBackLines);
                }
                var aLine = paper.path(Raphael.format(
                    "M{0},{1}L{2},{3}"),
                    ax, ay, bx, by
                ).attr(attrEdge);
                var bLine = paper.path(Raphael.format(
                    "M{0},{1}L{2},{3}"),
                    bx, by, cx, cy
                ).attr(attrEdge);
                var cLine = paper.path(Raphael.format(
                    "M{0},{1}L{2},{3}"),
                    cx, cy, ax, ay
                ).attr(attrEdge);
                var activeEl = paper.rect(0, 0, sizeX - 30, sizeY).attr({"fill": colorWhite, "fill-opacity": 0, "stroke-width": 0});
                var A = paper.circle(ax, ay, 7).attr(attrPoint);
                var B = paper.circle(bx, by, 7).attr(attrPoint);
                var C = paper.circle(cx, cy, 7).attr(attrPoint);

                var aLength = paper.text(330, 30, Math.round(Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2)) / 15)).attr(attrNumb);
                var bLength = paper.text(330, 90, Math.round(Math.sqrt(Math.pow(bx - cx, 2) + Math.pow(by - cy, 2)) / 15)).attr(attrNumb);
                var cLength = paper.text(330, 150, Math.round(Math.sqrt(Math.pow(cx - ax, 2) + Math.pow(cy - ay, 2)) / 15)).attr(attrNumb);

                var circles = paper.set(A, B, C);
                var activeCircle = null;
                var flag = false;

                var connections = [
                    [A, B, aLine, aLength],
                    [B, C, bLine, bLength],
                    [C, A, cLine, cLength],
                ];

                A.con = [0, 2];
                B.con = [0, 1];
                C.con = [1, 2];

                circles.mousedown(function (e) {
                    activeCircle = this;
                    this.animate({fill: colorOrange4}, 200);
                    activeEl.toFront();
                    flag = true;
                });

                var restoreCircle = function () {
                    if (activeCircle) {
                        activeCircle.animate({fill: colorBlue4}, 200);
                    }
                    activeCircle = null;
                    circles.toFront();
                    if (flag) {
                        flag = false;
                        this_e.extSendToConsoleCheckiO([Number(aLength.attr("text")), Number(bLength.attr("text")), Number(cLength.attr("text"))]);
                    }
                };

                circles.mouseup(restoreCircle);
                activeEl.mouseup(restoreCircle);
                activeEl.mouseout(restoreCircle);

                var moveCircle = function (e) {
                    if (activeCircle) {
                        activeCircle.attr({cx: e.offsetX - 10, cy: e.offsetY - 10});
                        for (var i = 0; i < activeCircle.con.length; i++) {
                            var con = connections[activeCircle.con[i]];
                            con[2].attr("path", Raphael.format(
                                "M{0},{1}L{2},{3}",
                                con[0].attr("cx"),
                                con[0].attr("cy"),
                                con[1].attr("cx"),
                                con[1].attr("cy")
                            ));
                            con[3].attr("text",
                                Math.round(Math.sqrt(Math.pow(con[0].attr("cx") - con[1].attr("cx"), 2) + Math.pow(con[0].attr("cy") - con[1].attr("cy"), 2)) / 1.5) / 10);
                        }
                    }
                };
                circles.mousemove(moveCircle);
                activeEl.mousemove(moveCircle);

            };

        }
        //TRYIT code
        var $tryit;
        var io = new extIO({
            animation: function($expl, data){
                var checkioInput = data.in;
                if (!checkioInput){
                    return;
                }

                var canvas = new TriangleAnglesCanvas();
                canvas.createCanvas($expl[0], checkioInput);
            },
            retConsole: function (ret) {
                try {
                    ret = JSON.parse(ret);
                }
                catch (err) {}

                $tryit.find(".checkio-result").html("Result:&nbsp;" + JSON.stringify(ret));
            },
            tryit:function (this_e) {
                $tryit = $(this_e.extSetHtmlTryIt(this_e.getTemplate('tryit')));

                var tCanvas = new TriangleAnglesCanvas();
                tCanvas.createFeedbackCanvas($tryit.find(".tryit-canvas")[0], this_e);

                $tryit.find(".tryit-canvas").mousedown(function (e) {
                    e.preventDefault();
                });
            },
            functions: {
                js: 'triangleAngles',
                python: 'checkio'
            },
            multipleArguments: true,
        });
        io.start();
    }
);

