$(() => {
    
    let form = $('#form')
    let uploadForm = $('#uploadForm')
    let submit = $('#submit')
    let file = $('#file')
    let filename = $('#filename')

    $('.dropdown').on('show.bs.dropdown', function(e){
        $(this).find('.dropdown-menu').first().stop(true, true).slideDown(300);
    });
      
    $('.dropdown').on('hide.bs.dropdown', function(e){
        $(this).find('.dropdown-menu').first().stop(true, true).slideUp(200);
    });
    //dropdown animation
    
    function getParent () {
        let selected = form.find('option:selected')
        let n = selected.length -1
        if($(selected[n]).val() == '')
            n--
        return $(selected[n])
    }
    uploadForm.submit(function(e) {
        e.preventDefault()
        let parent = getParent()
        if(!parent.data('isTerminal')){
            $.alert({
                title: 'Error',
                content:'You can only upload to a terminal node!',
                backgroundDismiss: true
            })
            return
        }
        let formData = new FormData()
        formData.append('file', file.prop('files')[0])
        formData.append('filename',filename.val())
        formData.append('parentID',parent.data('id'))
        $.alert({
            title: 'Uploading file',
            content: function () {
                var self = this;
                return $.ajax({
                    type: "POST",
                    enctype: 'multipart/form-data',
                    url: "/admin/upload/",
                    data: formData,
                    processData: false,
                    contentType: false
                }).done(filename => {
                    self.setTitle('Success')
                    self.setType('green')
                    self.setContent(`Successfully uploaded ${filename}!`)
                })
                .fail((e) => {
                    self.setTitle('Error')
                    self.setType('red')
                    self.setContent('Something went wrong.')
                })
            }
        })
    })
    function addToList (data) {
        if(typeof data.label == 'undefined')
            return
        let div = $('<div>').toggleClass('form-group')
        .append(
            $('<label>')
            .text(data.label)
        )
        let op = $('<select>')
        .attr('name',data.label)
        .toggleClass('form-control')
        .append(
            $('<option>').attr({
                'selected': 'true',
                'disabled': 'true',
            })
        )
        .change(function () {
            $(this).parent().nextAll().each(function () {
                $(this).remove()
            })
            let ele = $('option:selected',this)
            if(ele.data('isTerminal'))
                return
            let objID = ele.data('id')
            $.get(`/items/${objID}`).done((data) => {
                addToList(data)
            })
        })
        if(typeof data.options == 'object'){
            for(x of data.options){
                op.append(
                    $('<option>')
                    .attr('value',`${x.name}`)
                    .text(`${x.name}`)
                    .data({
                        'id':x.id,
                        'isTerminal':x.isTerminal
                    })
                )
            }
        }
        div.append(op)
        form.append(div)
    }
    $.get('/items/root').done((data) => {
        addToList(data)
    })
    
})