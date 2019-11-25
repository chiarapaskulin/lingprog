// ==UserScript==
// @name LATAM Kanban Board
// @namespace Violentmonkey Scripts
// @match https://sapjira.wdf.sap.corp/secure/RapidBoard.jspa?rapidView=19801*
// @grant none
// @homepageURL https://github.wdf.sap.corp/raw/kanban-hub/integration-service/latam/ui-script/ui_script.js
// @downloadURL https://github.wdf.sap.corp/raw/kanban-hub/integration-service/latam/ui-script/ui_script.js
// @updateURL https://github.wdf.sap.corp/raw/kanban-hub/integration-service/latam/ui-script/ui_script.js
// @version 2.17
// ==/UserScript==

//CSS Sheet
var customCSS = `
/*REMOVE BOTÃO DE RELEASE*/
.ghx-column-headers .ghx-release{display: none}

/*AJUSTA TAMANHO DO TITULO DAS COLUNAS*/
.ghx-column-headers .ghx-limits{ display: none; }

/*ARRUMA COR DE WIP ESTOURADO NA COLUNA*/
.ghx-columns .ghx-column.ghx-busted-max{ background-color: #ffdede; }
.WIPStyle{ background: #ff00000f; top: -1px; left: 0px; position: absolute; z-index: -1;}

/*ARRUMA POSIÇÃO DOS TITULOS DAS SWIMLANES*/
.ghx-swimlane-header .ghx-heading { margin:5px 0px 5px 0px; }
.ghx-swimlane-header .ghx-expander .ghx-iconfont { margin:5px 0px 5px -4px; }
.ghx-swimlane:last-of-type { margin-bottom: 10px; }

/*ESCONDE MINI-TITULOS DAS SUBTASKS DE INCIDENTE*/
.ghx-columns .ghx-column .ghx-parent-stub { display:none; }
.ghx-columns .ghx-column .hidebyfilter { display:none !important; }

/*AJUSTA POSIÇÃO DO CONTENT*/
.ghx-band-1 .ghx-issue .ghx-issue-content,
.ghx-band-2 .ghx-issue .ghx-issue-content,
.ghx-band-3 .ghx-issue .ghx-issue-content { padding: 0px; margin-left: 32px; min-height: 0px; }

/*AJUSTA TEXTO DOS CARDS (SUMMARY)*/
.ghx-columns .ghx-column .ghx-issue-fields .ghx-key { display:none !important; }
.ghx-columns .ghx-column .ghx-issue-fields .ghx-type { display:none !important; }
.ghx-columns .ghx-column .ghx-issue-fields .ghx-summary { padding: 0 0 5px; }
.ghx-columns .ghx-column .ghx-issue-fields .ghx-summary em { padding: 0px 2px 0px 3px; font-weight: 600; font-size: 0.65rem; font-style: italic; color: #546E7A; }
.ghx-columns .ghx-column .ghx-issue-fields .ghx-summary p { line-height: 15px; margin: 0px 2px 0px 3px; overflow: hidden; }
.ghx-extra-fields { display:none !important; }

/*AJUSTA POSIÇÃO DO TITULO DO CARD*/
.ghx-band-1 .ghx-issue-fields,
.ghx-band-2 .ghx-issue-fields,
.ghx-band-3 .ghx-issue-fields { margin: 0px; }
.ghx-band-1 .ghx-has-corner .ghx-issue-fields, .ghx-band-2.ghx-has-avatar .ghx-issue-fields,
.ghx-band-2 .ghx-has-corner .ghx-issue-fields, .ghx-band-2 .ghx-has-avatar .ghx-issue-fields,
.ghx-band-3 .ghx-has-corner .ghx-issue-fields, .ghx-band-3 .ghx-has-avatar .ghx-issue-fields { padding-right: 0px}

/*REMOVE ESPAÇO NA LATERAL ESQUERDA DOS INCIDENTES*/
ul.ghx-columns li.ghx-column div.ghx-subtask-group .ghx-issue-subtask { margin-left:0px !important; }
.ghx-issue { margin:0px !important; }

/*REMOVE PADDING EMBAIXO DE INCIDENTES*/
.ghx-parent-stub:not(.ghx-filtered)~.ghx-subtask-group { padding-bottom: 0; }

/*AUMENTA LARGURA DA COLUNA E MPT*/
ul.ghx-columns li.ghx-column div.ghx-issue .ghx-grabber { width: 32px; border-right: 1px solid #ddd; }

/*PUXA PRA FRENTE OS PONTINHOS DE DIAS*/
.ghx-days{ display:none; }

/*AJUSTA ICONES A ESQUERDA DO CARD*/
.ghx-band-1 .ghx-issue .ghx-flags,
.ghx-band-2 .ghx-issue .ghx-flags,
.ghx-band-3 .ghx-issue .ghx-flags { top: 5px; left: 4px;  height: auto; width: 25px; z-index: 1; position: absolute; display: flex; flex-direction: column;}
.ghx-band-1 .ghx-issue .ghx-flags>*,
.ghx-band-2 .ghx-issue .ghx-flags>*,
.ghx-band-3 .ghx-issue .ghx-flags>* { display: block; height: 25px; width: 25px; margin-bottom: 2px; overflow: hidden; position: relative; right: auto; top: auto; left: auto; z-index: 1;}

/*AJUSTA TAMANHO DO AVATAR*/
.ghx-band-1 .ghx-issue .ghx-avatar-img,
.ghx-band-2 .ghx-issue .ghx-avatar-img, 
.ghx-band-3 .ghx-issue .ghx-avatar-img { height: 25px; width: 25px; }

/*AJUSTA ICONE DE PRIORIDADE*/
.ghx-issue .ghx-priority { display: none !important; }

/*AJUSTA ICONE DE EXPIRE DATE*/
.expireDate { background-color: #ffffff87; border-radius: 50%; text-align: center; line-height: 25px; }
.expireDate span {font-family: "Verdana"; font-size: 0.75rem; font-weight: bold; color: black; text-align: center;}

/*TROCA IMAGEM DE AVATAR DO MARCELO*/
.avatar-marcelo { background: url(https://sapjira.wdf.sap.corp/secure/attachment/758320/canarinho-pistola.png) center center no-repeat scroll !important; background-size: contain !important; color: transparent; }

/*ALTERA DESIGN DE CARD FOSFORO*/
.ghx-issue.ghx-flagged {background: #dcdbdb;}
.ghx-issue.ghx-flagged .ghx-flags .ghx-flag { display: none; }
.ghx-issue.ghx-flagged .ghx-issue-content {background: url(https://sapjira.wdf.sap.corp/secure/attachment/783817/goal-ball.png) center center no-repeat scroll transparent !important; background-size: cover !important; }
.ghx-issue.ghx-flagged .ghx-issue-fields .ghx-summary { color:#fff; background-color: #0000004f; }
.ghx-issue.ghx-flagged .ghx-issue-fields .ghx-summary em { color:#fff; }

/*ICONE DE NOVIDADE (NEWS)*/
.k4s-notification-icon { position: absolute; z-index: 1; top: 2px; right: 2px; width: 15px; height: 15px; background: url(https://sapjira.wdf.sap.corp/secure/attachment/792449/notification.png) center center no-repeat scroll transparent !important; background-size: cover !important; }

/*ADICIONA PADDING EM NOVOS ELEMENTOS DA SWIMLANE*/
.k4s-description { padding-left: 5px; }

/*CRIA LABEL PARA CONTADOR DO TOTAL IN PROCESS*/
.total-running{ display: inline-block; line-height: 1; margin: 0 5px 0 0; padding: 7px 10px; border-radius: 3px; background: #205081; color: white; font-size: 14px; border: 1px solid transparent;}
.total-expiring{ display: inline-block; line-height: 1; margin: 0 5px 0 0; padding: 7px 10px; border-radius: 3px; background: #b53737; color: white; font-size: 14px; border: 1px solid transparent;}
#js-quickfilters-label {display: none;}
.ghx-controls-list>dl {margin: 0px !important;}

/* DIV ASSIGNEE */
.k4sassignees{ position: sticky; bottom: 0; padding: 5px; background-color:white; text-align: center; border: 1px solid #f5f5f5; width: fit-content; margin-right: auto; 
    margin-left: auto; border-radius: 3px; z-index:99; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.15), 0 6px 20px 0 rgba(0, 0, 0, 0.15); }
.k4sassignee{ display: inline-block; padding: 2px 10px 2px 10px; border-radius: 3px; border: 1px solid transparent; margin: 0px 10px 0px 10px;}
.k4sassigneenum{ display: inline-block; font-weight: bold; margin-left: 15px; font-size: 20px; vertical-align: middle; }
.k4sassignok{ background: #f5f5f5; }
.k4sassignwarning{ background: rgb(255, 198, 105); }
.k4sassigndanger{ background: #fc6a6a; }
.k4sassignover{ background: black; color: white; }

/* DIV PARA VERSÃo DO SCRIPT */
.script-version { display: inline-block; line-height: 1; float: right; margin: 0 35px 0 0; padding: 7px 10px; color: #3b73af; font-size: 14px; }

/* TAG Icons */ 
.k4s-blocked-icon{
  position: absolute;
  z-index: 201;
  background-color: #fc6a6a; 
  border-radius: 15%; 
  top: 2px;
  right: -5px;
  font-size : 7pt;
  color : white;
  padding: 0px 2px 0px 2px;
  -ms-transform: rotate(30deg); /* IE 9 */
  -webkit-transform: rotate(30deg); /* Safari */
  transform: rotate(30deg);
}

.k4s-customer-action-icon{
  position: absolute;
  z-index: 200;
  background-color: gray; 
  border-radius: 15%; 
  top: 2px;
  right: -5px;
  font-size : 7pt;
  color : white;
  padding: 0px 2px 0px 2px;
  -ms-transform: rotate(30deg); /* IE 9 */
  -webkit-transform: rotate(30deg); /* Safari */
  transform: rotate(30deg);
}

.k4s-out-icon{
  position: absolute;
  z-index: 200;
  background-color: purple;
  border-radius: 15%; 
  top: 2px;
  right: -5px;
  font-size : 7pt;
  color : white;
  padding: 0px 2px 0px 2px;
  -ms-transform: rotate(30deg); /* IE 9 */
  -webkit-transform: rotate(30deg); /* Safari */
  transform: rotate(30deg);
}

.k4s-synch-icon{
  position: absolute;
  z-index: 200;
  background-color: green;
  border-radius: 15%; 
  top: 2px;
  right: -5px;
  font-size : 7pt;
  color : white;
  padding: 0px 2px 0px 2px;
  -ms-transform: rotate(30deg); /* IE 9 */
  -webkit-transform: rotate(30deg); /* Safari */
  transform: rotate(30deg);
}

.k4s-lpm-icon{
  position: absolute;
  z-index: 200;
  background-color: #1E88E5;
  border-radius: 15%; 
  top: 2px;
  right: -5px;
  font-size : 7pt;
  color : white;
  padding: 0px 2px 0px 2px;
  -ms-transform: rotate(30deg); /* IE 9 */
  -webkit-transform: rotate(30deg); /* Safari */
  transform: rotate(30deg);
}

.k4s-dev-icon{
  position: absolute;
  z-index: 200;
  background-color: teal;
  border-radius: 15%; 
  top: 2px;
  right: -5px;
  font-size : 7pt;
  color : white;
  padding: 0px 2px 0px 2px;
  -ms-transform: rotate(30deg); /* IE 9 */
  -webkit-transform: rotate(30deg); /* Safari */
  transform: rotate(30deg);
}

/* Country icon */
.country-flag-icon {  
  line-height: 20px;
  background-color: #ffffff87; 
  border-radius: 50%; 
  position: absolute;
}

.ar-icon{
  background-image: url(https://sapjira.wdf.sap.corp/secure/attachment/1200585/ar_64x64.png) !important; 
  background-size: 25px 25px;
  width: 25px; 
  height: 20px;  
}

.cl-icon{
  background-image: url(https://sapjira.wdf.sap.corp/secure/attachment/1200586/cl_64x64.png) !important;
  background-size: 25px 25px;
  width: 25px; 
  height: 20px;
}

.co-icon{
  background-image: url(https://sapjira.wdf.sap.corp/secure/attachment/1200587/co_64x64.png) !important;
  background-size: 25px 25px;
  width: 25px; 
  height: 20px;
}

.mx-icon{
  background-image: url(https://sapjira.wdf.sap.corp/secure/attachment/1200588/mx_64x64.png) !important;
  background-size: 25px 25px;
  width: 25px; 
  height: 20px;
}

.ve-icon{
  background-image: url(https://sapjira.wdf.sap.corp/secure/attachment/1200589/ve_64x64.png) !important;
  background-size: 25px 25px;
  width: 25px; 
  height: 20px;
}

.latam-icon{
  background-image: url(https://sapjira.wdf.sap.corp/secure/attachment/1200835/latam_64x64.png) !important;
  background-size: 25px 25px;
  width: 25px; 
  height: 20px;
}

/* Briefer */ 
#brieferHref:link {color: white;}
#brieferHref:visited {color: white;}
#brieferHref:hover {color: blue;}
#brieferHref:active {color: white;}
.current-briefer{ 
  display: inline-block; 
  line-height: 1; 
  margin: 0 5px 0 0; 
  padding: 7px 10px; 
  border-radius: 3px; 
  background: gray; 
  color: white; 
  font-size: 14px; 
  border: 1px solid transparent;
}
#helpHref:link {color: white;}
#helpHref:visited {color: white;}
#helpHref:hover {color: blue;}
#helpHref:active {color: white;}
.help-button{ 
  display: inline-block; 
  line-height: 1; 
  margin: 0 5px 0 0; 
  padding: 7px 10px; 
  border-radius: 3px; 
  background: gray; 
  color: white; 
  font-size: 14px; 
  border: 1px solid transparent;
}

/* DoD - Percentage */
.dod-percentage{
  margin-bottom: 7px;
  margin-left: 5px;
  margin-right: 5px;
}

.dod-percentage-grey{
  color:#000!important;
  background-color:#9e9e9e!important
}

.dod-percentage-border{
  border:1px solid #ccc!important
}

/* Tooltip text */
.dod-percentage .dod-tooltip {
  display: none;
  width: 200px;
  background-color: #555;
  color: #fff;
  text-align: left;
  padding: 5px 0;
  border-radius: 6px;

  /* Position the tooltip text */
  position: absolute;
  z-index: 1000 !important;
  bottom: 125%;
  left: 50%;
  margin-left: -60px;

  /* Fade in tooltip */
  opacity: 0;
  transition: opacity 0.3s;
}

/* Tooltip arrow */
.dod-percentage .dod-tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #555 transparent transparent transparent;
}

/* Show the tooltip text when you mouse over the tooltip container */
.dod-percentage:hover .dod-tooltip {
  display: block;
  opacity: 1;
}

.total-country{
  display: inline;
  border-radius: 3px;
  border: 1px solid transparent;
  height : 30px;
  margin-left: 4px;
  padding: 4px;
}

.total-country-icon{
  display: inline-block;
  background-size: 18px 18px;
  width: 24px; 
  height : 24px;
  background-repeat: no-repeat;
  position: absolute;
  margin-top: 5px;
}

.total-number{
  font-weight: bold;
  margin-left: 20px;
  /*font-size: 20px;*/
  /*vertical-align: middle;*/
  display: inline-block;
}

.total-ar-icon{
  background-image: url(https://sapjira.wdf.sap.corp/secure/attachment/1200585/ar_64x64.png) !important; 
}

.total-cl-icon{
  background-image: url(https://sapjira.wdf.sap.corp/secure/attachment/1200586/cl_64x64.png) !important;
}

.total-co-icon{
  background-image: url(https://sapjira.wdf.sap.corp/secure/attachment/1200587/co_64x64.png) !important;
}

.total-mx-icon{
  background-image: url(https://sapjira.wdf.sap.corp/secure/attachment/1200588/mx_64x64.png) !important;
}

.total-ve-icon{
  background-image: url(https://sapjira.wdf.sap.corp/secure/attachment/1200589/ve_64x64.png) !important;
}

.total-latam-icon{
  background-image: url(https://sapjira.wdf.sap.corp/secure/attachment/1200835/latam_64x64.png) !important;
}

`;

//Status column IDs
const gc_Briefing = 95846;
const gc_Analysis = 95847;
const gc_Dev = 95848;
const gc_Test = 95849;
const gc_Delivery = 95850;
const gc_Feedback = 95851;
const gc_Closure = 95852;

const master_backlog = 'https://sapjira.wdf.sap.corp/browse/GSHCMLACLA20-116'

//Adiciona CSS customizado na página
function addGlobalStyle() {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = customCSS;
    head.appendChild(style);
}

//Muda o card de backlog para ter uma cor no card inteiro ao inves de somente na lateral
var changeBacklogCardColor = function () {
    //Itera todos os elementos com classe grabber
    $('.ghx-grabber').each(function (index, element) {
        let el = $(element);
        //Testa se tem classe subtask para saber se é um backlog
        if (!el.parent().hasClass("ghx-issue-subtask")) {
            //caso seja um backlog altera a cor do card e tira a barra lateral de MPT
            el.parent().css('background-color', el.css('background-color'));
            el.css('display', 'none');
        }
    });
};

const setLabelIcon = () => {

  $('.ghx-issue').each((index, element) => {
    
    if( hasLabel( element , 'blocked' ) ){
      
      var blockedIcon = $(element).find('.k4s-blocked-icon')
      if( blockedIcon.length < 1) {
        blockedIcon = $('<div class="k4s-blocked-icon">on hold</div>');
        blockedIcon.appendTo( $(element).find('.ghx-summary') );
      }
    }  
    else if( hasLabel( element , 'customer_action' ) ){
      
      var blockedIcon = $(element).find('.k4s-customer-action-icon')
      if( blockedIcon.length < 1) {
        blockedIcon = $('<div class="k4s-customer-action-icon">cust. action</div>');
        blockedIcon.appendTo( $(element).find('.ghx-summary') );
      }
    }else if( hasLabel( element , 'out' ) ){
      
      var blockedIcon = $(element).find('.k4s-out-icon')
      if( blockedIcon.length < 1) {
        blockedIcon = $('<div class="k4s-out-icon">out</div>');
        blockedIcon.appendTo( $(element).find('.ghx-summary') );
      }
    }else if( hasLabel( element , 'synch' ) ){
      
      var blockedIcon = $(element).find('.k4s-synch-icon')
      if( blockedIcon.length < 1) {
        blockedIcon = $('<div class="k4s-synch-icon">synch</div>');
        blockedIcon.appendTo( $(element).find('.ghx-summary') );
      }
    }else if( hasLabel( element , 'lpm' ) ){
      
      var blockedIcon = $(element).find('.k4s-lpm-icon')
      if( blockedIcon.length < 1) {
        blockedIcon = $('<div class="k4s-lpm-icon">LPM</div>');
        blockedIcon.appendTo( $(element).find('.ghx-summary') );
      }
    }else if( hasLabel( element , 'dev' ) ){
      
      var blockedIcon = $(element).find('.k4s-dev-icon')
      if( blockedIcon.length < 1) {
        blockedIcon = $('<div class="k4s-dev-icon">dev</div>');
        blockedIcon.appendTo( $(element).find('.ghx-summary') );
      }
    }
    
  });
};

//Adiciona negrito no titulo do Card
var changeCardTitle = function () {
    var arrSummarys = document.getElementsByClassName('ghx-summary');
    for (let x in arrSummarys) {
        let title = arrSummarys[x].title;
        if (title != undefined && title.length > 0) {
            if( title.indexOf(':') != -1 ){
              arrSummarys[x].innerHTML = '<em>' + title.substr(0, title.indexOf(':') + 1) + '</em>' +
                '<p>' + title.substr(title.indexOf(':') + 1) + '</p>';
            }
            else{
              arrSummarys[x].innerHTML = '<p style="margin-top:5px;">' + title + '</p>';
            }
        }
    }
};

var getLabels = element => {
  
    let labels = "";
    
    $(element).find( '.ghx-extra-field-row .ghx-extra-field' ).each( (index, item) => {
      
      if( $(item).attr( 'data-tooltip' ).indexOf( "Labels:" ) > -1 ){
        labels = $(item).attr( 'data-tooltip' );
      }
        
    } );
    
    return labels;
  }

var hasLabel = (element, label) => {
  
    let labels = getLabels( element );
        
    if(labels.toUpperCase().indexOf( label.toUpperCase() ) != -1){
      return true;
    }
    
    return false;
  }

//Conta quantos incidentes tem em cada coluna
var countTotals = function () {
    var total = 0;

    let all_incidents = document.getElementsByClassName('ghx-issue-subtask');
    
    for (var value of all_incidents) {
      if(value.offsetParent == null){
         continue;
      }
      
      if (value.offsetParent.dataset.columnId == gc_Briefing || 
          value.offsetParent.dataset.columnId == gc_Analysis ||
          value.offsetParent.dataset.columnId == gc_Dev ||
          value.offsetParent.dataset.columnId == gc_Test ||
          value.offsetParent.dataset.columnId == gc_Delivery ) {

            if( hasLabel( value , 'customer_action')  == false &&
                hasLabel( value , 'blocked')  == false ){            
                total++;
            }        
       }
    }
  
    var totalRunnning = $('#k4s-total-running');
    if (totalRunnning.length < 1) {
        totalRunnning = $('<div id="k4s-total-running" class="total-running"></div>');
        totalRunnning.appendTo('#ghx-controls-work');
    }
    totalRunnning.html('Incidents: ' + total);
};

//Verifica WIP das colunas combinadas
var checkWIP = function () {
    var totalIncidentsInProcess = 0;
    var totalIncidentsWithoutAssignee = 0;

    $("li[data-column-id=" + gc_Analysis + "], [data-column-id=" + gc_Dev + "], [data-column-id=" + gc_Test + "]").find('.ghx-avatar').each(function (index, element) {
        if ($(element).find('.ghx-avatar-img').length == 0) {//dont has Assignee
            totalIncidentsWithoutAssignee++;
        }
        totalIncidentsInProcess++;
    });

    if (totalIncidentsWithoutAssignee > 2) {
        var analysis = $(".ghx-first [data-column-id=" + gc_Analysis + "]");
        var test = $("[data-column-id=" + gc_Test + "]");

        var height = test.get(0).getBoundingClientRect().bottom - analysis.offset().top;
        var width = test.offset().left + test.width() - analysis.offset().left;

        var wipBlock = $('#k4s-wipblock');
        if (wipBlock.length < 1) {
            wipBlock = $('<div id="k4s-wipblock" class="WIPStyle"></div>');
            wipBlock.appendTo(analysis);

            $("[data-id=" + gc_Analysis + "], [data-id=" + gc_Dev + "], [data-id=" + gc_Test + "]").addClass("ghx-busted ghx-busted-max");

            $("[data-column-id=" + gc_Analysis + "], [data-column-id=" + gc_Dev + "], [data-column-id=" + gc_Test + "]").addClass("ghx-busted ghx-busted-max");
        }
        wipBlock.css({ "height": height + 1, "width": width + 1 });
    }
};

//Calcula quantidade de dias até estourar o MPT ou RDD
var setExpireDateIcon = function () {

    $('.ghx-issue').each(function (index, element) {
        let issue = $(element);
        let labels = getLabels (element);
        let expireDate = labels.match(/EXPIREDATE_(\d+)/);
        let days = labels.match(/DAYS_(\d+)/);

        if (days != undefined) {
            days = days[1];
        } else if (expireDate != undefined) {
            var one_day = 1000 * 60 * 60 * 24;
            var today = new Date();
            expireDate = new Date(expireDate[1].substr(0, 4), (expireDate[1].substr(4, 2) - 1), expireDate[1].substr(6, 2));
            days = Math.ceil((expireDate.getTime() - today.getTime()) / (one_day));
            if (Math.abs(days) > 99) {
                days = "&infin;"
            }
        }

        if (days != undefined) {
            var expireIcon = issue.find('.expireDate')
            if (expireIcon.length < 1) {
                expireIcon = $('<div class="expireDate"></div>');
                
                expireIcon.appendTo(issue.children('.ghx-flags'));
            }
            expireIcon.html('<span>' + days + '</span>');
        }
    });
};

var removeUnasignedAvatars = function () {
    $('.ghx-issue').each(function (index, element) {
        let issue = $(element);
        let avatar = issue.find('.ghx-avatar-img');
        if (avatar.length < 1) {
            issue.find('.ghx-avatar').css("display", "none");
        }
    });
}

var adjustCardSize = function () {
    $('.ghx-issue').each(function (index, element) {
        let countIcons = 0;
        let issue = $(element);

        let avatar = issue.find('.ghx-avatar-img');
        if (avatar.length > 0 && avatar.css("display") != "none") {
            countIcons++;
        }  
      
        let expireDate = issue.find('.expireDate');
        if (expireDate.length > 0 && expireDate.css("display") != "none") {
            countIcons++;
        }
      
        let countryFlag = issue.find('.country-flag-icon');
        if (countryFlag.length > 0 && countryFlag.css("display") != "none") {
            countIcons++;
        }
      
        if (countIcons <= 0) {
            issue.find('.ghx-summary').css({ "min-height": "20px", "max-height": "30px", "padding": "0px" });
        } else if (countIcons <= 1) {
            issue.find('.ghx-summary').css({ "min-height": "40px", "max-height": "40px", "padding": "0px" });
        } else if (countIcons <= 2) {
            issue.find('.ghx-summary').css({ "min-height": "65px", "max-height": "65px", "padding": "0px" });
        } else {
            issue.find('.ghx-summary').css({ "min-height": "85px", "max-height": "85px", "padding": "0px" });
        }
    });
}

var countIssuesByPerson = function () {
    let issuesByAssignee = {};
    $('.ghx-issue .ghx-avatar-img').each(function (index, element) {
        let assignee = "" + $(element).data('tooltip').replace('Assignee: ', '');

        if (issuesByAssignee.hasOwnProperty(assignee)) {
            issuesByAssignee[assignee].count++;
        } else {
            issuesByAssignee[assignee] = { count: 1, img: $(element).attr('src') };
        }
    });

    let assignessBlock = $('#k4sassignees');

    if (assignessBlock.length < 1) {
        assignessBlock = $('<div>', { id: 'k4sassignees', class: 'k4sassignees' });
        $('#js-pool-end').append(assignessBlock);
    }

    $(assignessBlock).empty();

    //Generate DIV
    $.each(issuesByAssignee, function (key, value) {        
      addDivToAssignee(key, value);
    });
}

var addDivToAssignee = function (key, value) {
    let assignessBlock = $('#k4sassignees');
    let img = {};
    
    if (value.img != undefined) {
        img = $('<img>', { src: value.img, alt: key, class: 'ghx-avatar-img', 'data-tooltip': key })
        $(img).css('height', '25px');
        $(img).css('width', '25px');
        $(img).css('cursor', 'pointer');

    $(img).click( function(){
      let key = $(this).attr('data-tooltip');
      
      let showAll = false;

      $('.ghx-issue').each( function(index,element){

        if( $(element).is(":hidden") ){
          showAll = true;
          return;
        }

      } );

      $('.ghx-issue').each( function(index,element){

        if( showAll == true ){
          $(element).show();
          return;
        }

        let show = false;
        
        let isUnassigned = true;
        
        $(element).find( '.ghx-avatar-img' ).each( function(i,e){
          let assignee = $(e).data('tooltip').replace('Assignee: ', '');

          if( assignee == key ){
            show = true;
          }
          
          isUnassigned = false;

        } );
        
        if( key == "Unassigned" && isUnassigned ){
          show = true;
        }

        if( show == false ){
          $(element).hide();
        }
        else{
          $(element).show();
        }

      } );

    } );

  }
  else{
        let userName = key.substr(10, 1);
        img = $('<span>', { text: userName, alt: key, class: 'ghx-avatar-img', 'data-tooltip': key, style: "background-color: #7bc1a1" });
    }

    let num = $('<span>', { text: value.count, class: "k4sassigneenum" });
    let div = $('<div>', { class: "k4sassignee" });

    if (value.count > 3) {
        $(div).addClass('k4sassignover');
    } else if (value.count > 2) {
        $(div).addClass('k4sassigndanger');
    } else if (value.count > 1) {
        $(div).addClass('k4sassignwarning');
    } else {
        $(div).addClass('k4sassignok');
    }

    $(div).append(img);
    $(div).append(num);
    $(assignessBlock).append(div);
};

var addScriptVersion = function () {
    var scriptVersion = $('#k4s-script-version');
    if (scriptVersion.length < 1) {
        scriptVersion = $(`<div id="k4s-script-version" class="script-version">Version: ${GM_info.script.version}</div>`);
        scriptVersion.appendTo('#ghx-controls-work');
    }
};

var adjustLeftIconsPosition = function () {
    $('.ghx-issue').each(function (index, element) {
        let issue = $(element);
        let avatar = issue.find('.ghx-avatar');
        avatar.detach();
        avatar.prependTo(issue.children('.ghx-flags'));
    });
};

const addEcattSection = () => {
    let ecattElement =$('#k4secatt');
    if( ecattElement.length < 1 ){    
      ecattElement = $(`<a id="k4secatt" class="total-running" data-text="ECATTs">Next ECATTs</a>`);
      ecattElement.appendTo('#ghx-controls-work');
            
      $(ecattElement).click( () => {
        $( '#infoPopupMessagesListId' ).html( "Loading..." );
        $( '#infoPopupMessagesNumberSpanId' ).html( "ECATTs Regular Execution" );   
        try {
          $.get( 'https://sapjira.wdf.sap.corp/browse/GSHCMLACLA20-80' , result => {
            let content = $(result).find( '#descriptionmodule .mod-content' );
            $( '#infoPopupMessagesListId' ).html( content.html() );
            $( '#infoPopupMessagesListId' ).css( { margin : '20px' , width: 'auto' } );
          } );
        } catch (e) {
        } 
        $('#infoPopupSuperDivId').show();
        
      } );
    }
  
    try {
      $.get( 'https://sapjira.wdf.sap.corp/browse/GSHCMLACLA20-80' , result => {
        let content = $(result).find( "#descriptionmodule .mod-content" );
        var wrapper = new DOMParser().parseFromString(content.html(), "text/html");
        let datesArray = wrapper.body.querySelector('h2').innerText.match(/(\d{1,4}([.\-/])\d{1,2}([.\-/])\d{1,4})/g);
        updateEcattDates(datesArray, document.querySelector(`#k4secatt`));
      } ); 
    } catch (e) {
    }
    
  };

const updateEcattDates = (dates, element) => {
  
  if(!element){
    return;
  }

  if(element.getAttribute("data-startdate") !== dates[0] || element.getAttribute("data-enddate") !== dates[1]){
    element.setAttribute("data-startdate", dates[0]);
    element.setAttribute("data-enddate", dates[1]);
  }
  element.innerText = `${element.getAttribute("data-text")}: ${element.getAttribute("data-startdate")} - ${element.getAttribute("data-enddate")}`;
  if(isEcattWeek(element.getAttribute("data-startdate"), element.getAttribute("data-enddate"))){
    element.classList.remove('total-running');
    element.classList.add('total-expiring');
  }else{
    element.classList.remove('total-expiring');
    element.classList.add('total-running');
  }
}

const isEcattWeek = (startDate, endDate) => {
  
  let startDateObj = createDateObj(startDate);
  let endDateObj = createDateObj(endDate);
  let today = new Date();
  if((today.getDate() >= startDateObj.getDate() && today.getDate() <= endDateObj.getDate()) &&
     (today.getMonth() >= startDateObj.getMonth() && today.getMonth() <= endDateObj.getMonth()) &&
     (today.getFullYear() >= startDateObj.getFullYear() && today.getFullYear() <= endDateObj.getFullYear())){
    return true;
  }
  else{
    return false;
  }
  
}
  
const createDateObj = date => {
  
  let dateArray = date.split("/");
  return new Date(`${dateArray[1]}-${dateArray[0]}-${dateArray[2]}`);
  
}

const swimlaneInfo = () => {
  if(document.querySelector(`.k4s-description`) === null){
    let allSwimlanes = document.querySelectorAll(".ghx-swimlane");
    // create a span for the number of incidents/backlogs in a given lane
    allSwimlanes.forEach((swimlane) => {
      eachSwimlaneInfo(swimlane, "Task", "incidents");
      eachSwimlaneInfo(swimlane, "Backlog Item", "backlog item");
    });

    // set the total number of issues in each lane to bold
    document.querySelectorAll(`span.ghx-description:not(.k4s-description)`).forEach((swimlane) => { 
      swimlane.innerHTML = `<b>${swimlane.innerHTML} total</b>`;
    });    
  }
}

const eachSwimlaneInfo = (swimlane, issueTitle, issueType) => {
  let incidentCount = swimlane.querySelectorAll(`[swimlane-id='${swimlane.getAttribute('swimlane-id')}'] .ghx-issue [title='${issueTitle}']`).length;
  swimlane.querySelector(`.ghx-info`).appendChild(htmlToElement(`<span class="ghx-description k4s-description">#${incidentCount} ${issueType}</span>`));
}

const setCountryFlag = () => {
  
  $('.ghx-issue').each( (index, element) => {
    
    let countryIcon = $(element).find('.country-flag-icon');
    
    if( countryIcon.length < 1) {
      countryIcon = $('<div class="country-flag-icon"></div>');
      countryIcon.appendTo( $(element).children('.ghx-flags') );
    }
    
    if( hasLabel( element , 'PY-AR' ) || hasLabel( element , 'PA-PA-AR' ) ){
      $(countryIcon).addClass( 'ar-icon' );
    }else if(hasLabel( element , 'PY-CL' ) || hasLabel( element , 'PA-PA-CL' ) ){
      $(countryIcon).addClass( 'cl-icon' );
    }else if(hasLabel( element , 'PY-CO' ) || hasLabel( element , 'PA-PA-CO' ) ){
      $(countryIcon).addClass( 'co-icon' );
    }else if(hasLabel( element , 'PY-MX' ) || hasLabel( element , 'PA-PA-MX' ) ){
      $(countryIcon).addClass( 'mx-icon' );
    }else if(hasLabel( element , 'PY-VE' ) || hasLabel( element , 'PA-PA-VE' ) ){
      $(countryIcon).addClass( 've-icon' );
    }else{
      $(countryIcon).addClass( 'latam-icon' );
    }
    
  } );
                         
};

const createBrieferElement = () =>{
  let brieferElement = $('#k4s-briefer');
  if(brieferElement.length < 1){
      brieferElement = $(`<div id="k4s-briefer" class="current-briefer"></div>`);
      brieferElement.appendTo('#ghx-controls-work');
      brieferElement.html('Briefer: ');

  }
};

var setBriefer = () =>{
  try {
      $.get(master_backlog, result => {
          let brieferElement = $('#k4s-briefer');
          let content = $(result).find('#assignee-val');

          name = content.find('.user-hover').text();

          avatarURL = content.find('.aui-avatar-inner > img').attr('src');

          brieferElement.html(`<p>Briefer: <a id="brieferHref" href="${master_backlog}">${name}</a></p>`);  
      }); 
    } catch (e) {
    }  
  return name
}

const addHelpButton = () => {
  
  let helpElement =$( '#k4shelp' );
  if( helpElement.length < 1 ){
    helpElement = $('<a>' , { text : "Help ", id : "k4shelp" , class: "total-running" });
    helpElement.appendTo('#ghx-controls-work');
    $(helpElement).click( () => {
      
      $( '#infoPopupMessagesListId' ).html( "Loading..." );
      $( '#infoPopupMessagesNumberSpanId' ).html( "How to use the board" );
      
      try {
        $.get( master_backlog , result => {

          let content = $(result).find( '#descriptionmodule .mod-content' );

          $( '#infoPopupMessagesListId' ).html( content.html() );
          $( '#infoPopupMessagesListId' ).css( { margin : '20px' , width: 'auto' } );
        } );
      } catch (e) {
      }
      
      $('#infoPopupSuperDivId').show();
      
    } );
  }
};

//Esconde número de dias de MPT para incidentes confirmados
const hideMPTDaysConfirmedIssues = () => {
  
  $(`li[data-column-id=${gc_Closure}]`).find('.expireDate').each((index, element) => {
    $(element).hide();
  });
};
  
const htmlToElement = html => {
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}

const showDoD = () => {

  let columns = [ gc_Analysis , gc_Dev , gc_Test , gc_Delivery , gc_Feedback , gc_Closure ];
  
  $.each( columns , (index1, id) => {
  
    $( `[data-column-id=${id}] .ghx-issue` ).each( (index, element) => {

      let isDoD = undefined;

      //Find DoD tag and remove it from extra fields
      $(element).find( '.ghx-extra-fields .ghx-extra-field-row .ghx-extra-field' ).each( (index2, element2) => {

        if( $(element2).attr( 'data-tooltip' ).indexOf( "Definition of Done" ) > -1 ){
          let dodContent = $(element2).attr( 'data-tooltip' ).substring( 20 );

          let div = $( '<div>' );
          div.html( dodContent );

          isDoD = $(div).find( '#checklist-view' );

          $(element2).parent().remove();
        }

      } );

      if( isDoD != undefined ){

        $(isDoD).removeAttr( 'style' );

        let count = 0;
        let countTotal = 0;
        let countCompleted = 0;
        
        let doDTextList = $( '<div>' , { style : 'margin-bottom : 2px; position: relative;'  } );
        let doDTooltip = $( '<div>' , { class: "dod-tooltip", style : 'margin-bottom : 2px;'  } );
        
        $(isDoD).find( 'label' ).each( (index2, label) => {

          let isCompleted = false;

          $(label).find( 'input' ).each( (index3, checkbox) => {
            
            countTotal++;
            
            if( $(checkbox).is(':checked') ){
              isCompleted = true;
              countCompleted++;
              return;
            }

          } );
          
          $(label).find( 'div' ).each( (index3, div) => {
            $(div).removeAttr( 'style' );
            $(div).addClass( 'dodIssue' );            
            $(div).prepend( $( '<input>' , { type : 'checkbox' , disabled : true, checked: isCompleted  } ) );
            
            $(doDTooltip).append( div );
          } );

        } );
        
        if( countTotal > 0 ){
          let percentage = countCompleted / countTotal * 100;

          let divPercentageInside = $( '<div>' , { "class" : "dod-percentage-grey" , "style" : `height:2px;width:${percentage}%` } );
          let divPercentage = $( '<div>' , { "class" : "dod-percentage-border dod-percentage", "onClick" : "showTooltip()" } );
          $(divPercentage).append( divPercentageInside );
          
          $(divPercentage).append( doDTooltip );
          
          $(doDTextList).prepend( divPercentage );
        }
        
        $(element).find( '.ghx-issue-content .ghx-issue-fields' ).each( (index3, fields) => {
          $(fields).append( doDTextList );
        } );

      }

    } );
  } );
};

const issuesPerCountry = () => {

  let totalCounter = 0;
  let counter = {};

  $('.ghx-issue').each((index, element) => {

    let country = '';

    if (hasLabel(element, 'PY-AR') || hasLabel(element, 'PA-PA-AR')) {
      country = 'ar';
    } else if (hasLabel(element, 'PY-CL') || hasLabel(element, 'PA-PA-CL')) {
      country = 'cl';
    } else if (hasLabel(element, 'PY-CO') || hasLabel(element, 'PA-PA-CO')) {
      country = 'co';
    } else if (hasLabel(element, 'PY-MX') || hasLabel(element, 'PA-PA-MX')) {
      country = 'mx';
    } else if (hasLabel(element, 'PY-VE') || hasLabel(element, 'PA-PA-VE')) {
      country = 've';
    } else {
      country = 'latam';
    }

    if (counter.hasOwnProperty(country)) {
      counter[country].count++;
    } else {
      counter[country] = { count: 1, country: country };
    }

    totalCounter++;

  });

  $.each(counter, function (key, element) {

    let countryElement = $('#total_country_' + element.country);
    if (countryElement.length < 1) {
      let divIconHtml = `<span class="total-country-icon total-` + element.country + `-icon"></span>`;
      let divNumHtml = `<span class="total-number" id="total_number_` + element.country + `"></span>`;

      countryElement = $(`<div id="total_country_` + element.country + `" class="total-country">` + divIconHtml + divNumHtml + `</div>`);
      countryElement.appendTo('#ghx-controls-work');
    }

    let perc = element.count / totalCounter * 100;

    let classColor = '';

    if (perc < 25) {
      classColor = 'k4sassignok';
    }
    else if (perc < 40) {
      classColor = 'k4sassignwarning';
    }
    else if (perc < 55) {
      classColor = 'k4sassigndanger';
    }
    else{
      classColor = 'k4sassignover';
    }

    let numElement = $('#total_number_' + element.country);
    numElement.html(element.count);
    
    $(countryElement).attr("title", Math.round(perc) + '%');

    $(countryElement).removeClass('k4sassignok');
    $(countryElement).removeClass('k4sassignwarning');
    $(countryElement).removeClass('k4sassigndanger');
    $(countryElement).removeClass('k4sassignover');
    $(countryElement).addClass(classColor);

  });

}

//Inicializa todas as funções que alteram a página
var jsInitialization = function () {
    console.log("Start update!");
    changeBacklogCardColor();
    changeCardTitle();
    setCountryFlag();
    setExpireDateIcon();
    countTotals();    
    removeUnasignedAvatars();
    countIssuesByPerson();
    addScriptVersion();
    adjustLeftIconsPosition();
    adjustCardSize();
    checkWIP();
    setLabelIcon();
    createBrieferElement();
    setBriefer();
    hideMPTDaysConfirmedIssues();
    addHelpButton();
    addEcattSection();
    swimlaneInfo();
    showDoD();
    issuesPerCountry();
};

//Ponto de partida do Script
AJS.$(document).ready(function () {

    //Alterações do CSS
    addGlobalStyle();

    $('#jira').addClass('ghx-header-compact');

    //Inicialização das alterações do JS
    jsInitialization();

    //Verificador de mudanças no documento
    contentChangedIT();

    //Reload da página
    setInterval(function(){
        location.reload();
    },500000);
});

window.poolHtml = undefined;
function contentChangedIT() {
    window.poolHtml = $('#ghx-pool').html();
    setInterval(function () {
        var h = $('#ghx-pool').html();
        if (window.poolHtml != h) {
            jsInitialization();
            window.poolHtml = $('#ghx-pool').html();
        }
    }, 1000);
};