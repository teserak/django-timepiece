var scripts = document.getElementsByTagName('script'),
    script = scripts[scripts.length - 1];

//var entries = JSON.parse(script.getAttribute('data-entries'));

function Timeline(loc, start_time, end_time, width, height) {
    this.loc = loc;
    this.start_time = start_time;
    this.end_time = end_time;

    this.container = d3.select(this.loc).append('svg')
        .attr('height', height);

    this.width = width;
    this.height = height;

    // Settings
    this.draw_width = this.width - 40; // Draw inside the svg without clipping
    this.y_offset = 20; // Height offset from time marker
    this.interval = 3600000; // One hour in milliseconds
    this.edge_offset = 20; // Come off the edge
}

Timeline.prototype.draw = function() {
    var start_date = new Date(this.start_time),
        end_date = new Date(this.end_time),
        dt = this.end_time - this.start_time;

    
    this.line_offset = this.draw_width / (dt / this.interval);

    for(var i = 0; i <= dt / this.interval; i++) {
        var x_offset = i * this.line_offset + this.edge_offset;

        this.container.append('line')
            .attr('x1', x_offset).attr('x2', x_offset)
            .attr('y1', this.y_offset).attr('y2', this.height - this.y_offset)
            .style('stroke', '#000000');

        var hours = new Date(this.start_time + this.interval * i).getHours();
        hours = hours > 12 ? hours % 12 + ' p.m.' : hours + ' a.m.';

        this.container.append('text')
            .attr('x', x_offset - 15).attr('y', 10)
            .style('font-size', '10px')
            .style('fill', '#000000')
            .style('opacity', 1)
            .text(hours);
    }
};

function Entry(timeline, entry_data) {
    this.project_name = entry_data['project_name'];
    this.start_time = entry_data['start_time'];
    this.end_time = entry_data['end_time'];
    this.hours = entry_data['hours'];
    this.pk = entry_data['pk'];

    this.timeline = timeline;

    this.height = timeline.height - 2 * timeline.y_offset;
}

Entry.prototype.draw = function() {
    var timeline = this.timeline;

    var dt = this.end_time - this.start_time,
        width = timeline.line_offset * (dt / timeline.interval),
        x_offset = timeline.line_offset *
            (this.start_time - timeline.start_time) / timeline.interval  + timeline.edge_offset;

    var entry = timeline.container.append('rect')
        .attr('x', x_offset).attr('y', timeline.y_offset + 5)
        .attr('rx', 10).attr('ry', 10)
        .attr('height', this.height - 10)
        .attr('width', width);

    entry.transition()
        .delay(100)
        .duration(1500)
        .attr('fill', 'steelblue')
        .attr('stroke', '#333333')
        .attr('stroke-width', '2px')
        .style('opacity', '0.95');

    var text = timeline.container.append('text')
        .attr('font-weight', 'bolder')
        .style('font-size', '14px')
        .text(this.project_name);

    var text_box = text.node().getBBox(),
        entry_box = entry.node().getBBox();
    
    if(text_box.width > entry_box.width) {
        var sub = Math.ceil(text_box.width / (text_box.width - entry_box.width)), // Ratio using widths
            name = this.project_name.substring(0, sub) + '...';

        name = sub === 0 || entry_box.width < 30 ? '' : name;

        text.text(name);

        // New bounding box
        text_box = text.node().getBBox();
    }

    var text_xpos = x_offset + width / 2 - text_box.width / 2;

    text.attr('x', text_xpos)
        .attr('y', timeline.y_offset + this.height / 2 + text_box.height / 4);
      
    text.transition()
        .delay(100)
        .duration(1500)
        .attr('fill', '#FFFFFF')
        .style('opacity', '1.0');
};

(function() {
    var width = $('#timeline').width(),
        height = 100;

    d = new Date();

    t = new Timeline('#timeline', 1344600575682, 1344629375682, width, height);
    t.draw();

    new Entry(t, {
        'start_time': 1344601007339,
        'end_time': 1344604175282,
        'project_name': 'Awesomesauce'
    }).draw();

    new Entry(t, {
        'start_time': 1344604175682,
        'end_time': 1344619575682,
        'project_name': 'django-timepiece'
    }).draw();
    
}());
