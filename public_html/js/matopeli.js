$(function () {
    
    var pelin_leveys = 660;
    var pelin_korkeus = 660;
    var pelin_nopeus = 80;//pelin nopeus millisekunteina
    
    var nappi_x;
    var nappi_y;
    var nappi_leveys;
    var nappi_korkeus;
    
    var solun_koko = 30;//pelialusta, mato sekä ruoka kaikki "koostuu" soluista eli alusta jaetaan 30px*30px soluihin...jolloin kenttä koostuu 22x22 solusta
    
    var mato_koko;
    var mato = []; //mato arrayhyn tulee madon kokonaisuus eli miten mato "muodostuu", koska se voi mutkitella eli siis tämän avulla toteutetaan madon liikkuminen.
    var i;
    var mato_paa_x;//madon pään koordinaatit eli missä sen pää menee...
    var mato_paa_y;
    var mato_hanta;//matosen hanta eli peräpään solu
    var mato_suunta = "oikea";//suunta mihin mato liikkuu...alussa oikea kun peli käynnistyy
    var suunnan_esto = false;//apuna "huijauksen" estossa...
    var mato_itsemurha = false;//onko mato törmännyt itseensä?
    
    
    //------------------------Äänet---------------------------------------------
    
    var taustamusa = new Audio();
    
    taustamusa.src = "audio/taustamusa.mp3";
    
    taustamusa.volume = 0.3;
    
    
    taustamusa.addEventListener("ended", function(){//looppaus
        this.currentTime=0;
        this.play();
    });
    
    taustamusa.play();
    
    var haukku = new Audio();
    haukku.src = "audio/haukku.mp3";
    
    var tormays = new Audio();
    tormays.volume = 0.3;
    tormays.src = "audio/tormays.mp3";
    
    var peliaanet = true;
    
    var loppumusa = new Audio();
    loppumusa.src = "audio/loppu.mp3";
    loppumusa.volume = 0.5;
   
    //--------------------------------------------------------------------------
    //-----------------------Ääni nappula---------------------------------------
    $("#aanet_nappi").button({
                                    icons: {
                                    primary: "ui-icon-volume-on"
                                    },
                                    text: false
                                    });
    $("#aanet_nappi").click(function(){
        
        if (!peliaanet) {
            
            peliaanet = true;
            
            if (pelitila != "loppu") {
                taustamusa.play();
            } else if (pelitila == "loppu") {
                loppumusa.play();
            }
            
            $("#aanet_nappi").button({
                                    icons: {
                                    primary: "ui-icon-volume-on"
                                    },
                                    text: false
                                    });
        }else{
            
            peliaanet = false;
            taustamusa.pause();
            loppumusa.load();
            $("#aanet_nappi").button({
                                    icons: {
                                    primary: "ui-icon-volume-off"
                                    },
                                    text: false
                                    });
        }
        
    });
    
    
    
    
    //--------------------------------------------------------------------------
    //---------------------Kuvat------------------------------------------------
    //madon kuva
    var mato_kuva = new Image();
    mato_kuva.src = "img/mato.png";
    var mato_frame_x = 0;
    var mato_frame_y = 0;
    
    var mato_frame_leveys = 30;
    var mato_frame_korkeus = 30;
    
    var mato_leveys = mato_frame_leveys;
    var mato_korkeus = mato_frame_korkeus;
    
    //ruoka muuttuja ja omenan kuva ruokana...
    var ruoka;
    var omena = new Image();
    omena.src = "img/omena.png";
    
    var hauta = new Image();
    hauta.src = "img/hauta.png";
    
    var pisteet;//pisteitä pidetään yllä...
    
    var tekstin_leveys = "";
    
    var elementti = $("#pelialusta").get(0);
    elementti.width = pelin_leveys;
    elementti.height = pelin_korkeus;
    
    var konteksti = elementti.getContext("2d");
    
    var pelitila;
    var peli_looppi;
    
    //taustakuva ja se kun on latautunut niin aloitetaan peli...
    var tausta = new Image();
    tausta.src = "img/tausta2.jpg";
    tausta.onload = function () {
       aloitus();
    };
    
    
    
    //--------------------------------------------------------------------------
//-----------------------------Aloitus näyttö-----------------------------------
    function aloitus() {
        
        if(peliaanet){
            loppumusa.load();
            taustamusa.play();
        }
        
        pelitila = "aloitus";
        pisteet = 0;
        
        mato_koko = 4;//alussa mato 4 solun kokoinen
        mato = []; 
        mato_suunta = "oikea";
        
        for ( i = (mato_koko-1); i>=0; i--) {
        
            mato.push({//mato array muodostetaan vaakatasoon alussa
                       x:i, 
                       y:0
                       });
                       
        }
        
        arvoRuoka();//arvotaan ruuan sijainti globaalilla funktiolla, joka alempana...

        konteksti.drawImage(tausta, 0, 0, pelin_leveys, pelin_korkeus, 0, 0, pelin_leveys, pelin_korkeus);//taustan piirto
        
        konteksti.fillStyle = "black";
        konteksti.font = "19px Arial";
        
        var otsikko = "Ohjaa matoa nuolinäppäimillä ja koita syödä mahdollisimman monta omenaa";
        tekstin_leveys = konteksti.measureText(otsikko).width;
        
        konteksti.fillText(otsikko, ((pelin_leveys / 2) - (tekstin_leveys / 2)), (pelin_korkeus / 2));
        
        
        //Aloitus nappin piirto...
        konteksti.fillStyle = "black";


        nappi_leveys = 150;
        nappi_korkeus = 30;

        nappi_x = ((pelin_leveys / 2)-(nappi_leveys / 2));
        nappi_y = (pelin_korkeus / 2) + 30;

        konteksti.fillRect(nappi_x, nappi_y, nappi_leveys, nappi_korkeus);

        konteksti.fillStyle = "red";
        konteksti.font = "20px Arial";
        konteksti.fillText("Aloita", nappi_x + 50, nappi_y + 22);
        
    }
//------------------------------------------------------------------------------

//----------------------------Peli-looppi---------------------------------------
    function peli() {//peli pyörii tällä loopilla kunnes tömätään...
        
        pelitila = "peli";
        
        konteksti.drawImage(tausta, 0, 0, pelin_leveys, pelin_korkeus, 0, 0, pelin_leveys, pelin_korkeus);//taustan piirto
 
        var mato_paa_x = mato[0].x;//otetaan pää solun paikka koordinaatistosta mato arrayn ekasta solusta...Kenttähän koostuu 22x22soluista...
        var mato_paa_y = mato[0].y;
        
        //tarkistetaan mihin suuntaan liikutaan ja sen mukaan muutetaan pää solun koordinatteja...
        if (mato_suunta == "oikea") {
            
            mato_paa_x++;
            
        }
        if (mato_suunta == "vasen") {
            
            mato_paa_x--;
            
        }
        if (mato_suunta == "alas") {
            
            mato_paa_y++;
            
        }
        if (mato_suunta == "ylos") {
            
            mato_paa_y--;
            
        }
        
        //tarkistetaan ollaanko törmätty ruokaan...
        if (mato_paa_x==ruoka.x && mato_paa_y==ruoka.y) {
            
            //jos ollaan niin niin tehdään siitä "suoraan uusi" hanta ja haukku ääni jos äänet päällä...
            if (peliaanet) {
                haukku.load();
                haukku.play();
            }
            mato_hanta = {
                            x:mato_paa_x,
                            y:mato_paa_y
                         };
                         
            arvoRuoka();//arvotaan uusi ruan paikka...
            pisteet++;//pisteet kasvaa yllätys yllätys kun syö omenoita...
            
        } else {//jos ei omenaa syödä niin heitetään madon peräpään solu madon pääksi... eli siis liike perustuu tähän toiminta logiikkaan...
        
            mato_hanta = mato.pop();
            mato_hanta.x = mato_paa_x;
            mato_hanta.y = mato_paa_y;
        
        }

        mato.unshift(mato_hanta);
        
        //-----------madon, ruuan ja pisteiden piirto globaalien piirto functioiden avulla--------------
        for (i = 0; i < mato.length; i++) {
            
            var solu = mato[i];
            
            //valitaan madon kuvasta oikea frame... eli silmät tulee omille paikoille ja madon väliosa ja perä omasta framesta...
            if (i > 0 && i < (mato.length-1)) {
                mato_frame_x = 30;
            } else if (i == (mato.length-1)) {
                mato_frame_x = 30;
            } else {
                if (mato_suunta == "ylos" || mato_suunta == "alas") {
                    mato_frame_x = 0;
                } else {
                    mato_frame_x = 60;
                }
            }
            
            piirraMatoSolu(solu.x , solu.y);
            
        }
        
        piirraRuokaSolu(ruoka.x, ruoka.y);
        
        //pisteiden piirto
        konteksti.fillStyle = "white";
        konteksti.font = "20px Arial";
        
        pisteet_teksti = "Pisteet: " + pisteet;
        
        tekstin_leveys = konteksti.measureText(pisteet_teksti).width;
        
        konteksti.fillStyle = "black";
        konteksti.fillText(pisteet_teksti, ((pelin_leveys / 2) - (tekstin_leveys / 2)), pelin_korkeus-10);
        //------------------------------------------------------------------------------------------------------
        
        suunnan_esto = false;//huijauksen esto falseksi eli hyväksytään taas napin painalluksia...
        mato_itsemurha = matoItsemurhanTarkistus(mato_paa_x, mato_paa_y, mato);
        
        
        if (mato_paa_x <= -1 || mato_paa_y <= -1 || mato_paa_x >= (pelin_leveys/solun_koko) || mato_paa_y >= (pelin_korkeus/solun_koko) || mato_itsemurha == true) {//seinään törmäyksen ja itsemurhan tarkistus
            
            if (peliaanet) {
                tormays.play();
            }
            
            clearInterval(peli_looppi);
            loppu();
        }else{
           return;
        }
    }
//------------------------------------------------------------------------------    
//---------------------------Loppu----------------------------------------------
    function loppu() {
        
        pelitila = "loppu";
        taustamusa.load();
        
        if (peliaanet){
            loppumusa.play();
        }
        
        konteksti.clearRect(0, 0, pelin_leveys, pelin_korkeus);
        konteksti.fillStyle = "black";
        konteksti.fillRect(0, 0, pelin_leveys, pelin_korkeus);
        
        konteksti.drawImage(hauta, 0, 0, 60, 73, ((pelin_leveys/2) - 30), ((pelin_korkeus/2)-100), 60, 73);
        
        
        konteksti.fillStyle = "white";
        konteksti.font = "30px Arial";
        
        var lopputeksti = "Game over";
        tekstin_leveys = konteksti.measureText(lopputeksti).width;
        
        konteksti.fillText(lopputeksti, ((pelin_leveys / 2) - (tekstin_leveys / 2)), (pelin_korkeus / 2));
        
        konteksti.font = "20px Arial";
        loppupisteet = "Söit "+pisteet+" omenaa.";
        
        tekstin_leveys = konteksti.measureText(loppupisteet).width;
        
        konteksti.fillText(loppupisteet, ((pelin_leveys / 2) - (tekstin_leveys / 2)), (pelin_korkeus / 2) + 40);
        
        var ohjeet = "(Klikkaa ruutua pelataksesi uudelleen)";
        konteksti.beginPath();
        konteksti.fillStyle = "white";
        konteksti.font = "13pt Arial";

        tekstin_leveys = konteksti.measureText(ohjeet).width;
        
        konteksti.fillText(ohjeet, ((pelin_leveys / 2) - (tekstin_leveys / 2)), (pelin_korkeus / 2)+60);

    }

//------------------------------------------------------------------------------
//-------------------------Globaalit functiot-----------------------------------    
    function piirraMatoSolu(x,y) { //madon solujen piirto...
        
        konteksti.drawImage(mato_kuva, mato_frame_x, mato_frame_y, mato_frame_leveys, mato_frame_korkeus, x*solun_koko, y*solun_koko, mato_leveys, mato_korkeus);
        
    }
    function piirraRuokaSolu(x,y) {//ruoan piirto
        
        konteksti.drawImage(omena, 0, 0, 30, 30, x*solun_koko, y*solun_koko, solun_koko, solun_koko);
        
    }
    
    function matoItsemurhanTarkistus (mato_paa_x, mato_paa_y, mato) {//madon itseensä törmäyksen tarkistus funktio
        
        for (i = 1; i < mato.length; i++) {
            
            if(mato[i].x == mato_paa_x && mato[i].y == mato_paa_y)
            return true;
	}
            return false;
    }
    
    function arvoRuoka() {//ruuan arvonta funktio
		
                ruoka = {
                            x: Math.round(Math.random()*(pelin_leveys-solun_koko)/solun_koko), 
                            y: Math.round(Math.random()*(pelin_korkeus-solun_koko)/solun_koko)
                        };
                for (i = 1; i < mato.length; i++) {//estetään ettei ruoka voi tulla madon "sisään"
            
                    if(mato[i].x == ruoka.x && mato[i].y == ruoka.y) {//jos niin sattuu käymään niin arvotaan niin pitkään eittei niin käy...
                        
                        ruoka = {
                            x: Math.round(Math.random()*(pelin_leveys-solun_koko)/solun_koko), 
                            y: Math.round(Math.random()*(pelin_korkeus-solun_koko)/solun_koko)
                        };
                        break;
                        arvoRuoka();
                    }
                    
                }                
    }
//------------------------------------------------------------------------------    
    

//--------------------------------Pelin eventit---------------------------------    
    
    $("#pelialusta").click(function(e) {
        
       hiiri_x = e.pageX - this.offsetLeft;
       hiiri_y = e.pageY - this.offsetTop;
       
       if (pelitila == "aloitus") {
            if (hiiri_x >= nappi_x && hiiri_x <= (nappi_x + nappi_leveys) &&
               hiiri_y >= nappi_y && hiiri_y <= (nappi_y + nappi_korkeus)) 
            {    
                peli_looppi = setInterval(peli, pelin_nopeus); 
            }
        }
        
        if (pelitila == "loppu") {
            aloitus();
        }
    });
    
    $(document).keydown(function(e){//nuolinäppäin eventit...
    
            if (e.keyCode == 37 && mato_suunta !="oikea" && !suunnan_esto) {
                mato_suunta = "vasen";
                // estetään huijaus... ilman tätä jos peli loopin aikana kerkeää nopeasti painamaan kahta eri suuntaa, 
				//pystyy madon suunnan vaihtamaan ilman kääntymistä eli siis mato lähtee suoraan vastakkaiseen suuntaan... 
				//tämän avulla yhden loopin aikana hyväksytään vain yhden nuolinäppäimen painaminen muut ignoretetaan....
				suunnan_esto = true;
            }
            if (e.keyCode == 38 && mato_suunta !="alas" && !suunnan_esto) {
                mato_suunta = "ylos";
                suunnan_esto = true;
            }
            if (e.keyCode == 39 && mato_suunta !="vasen" && !suunnan_esto) {
                mato_suunta = "oikea";
                suunnan_esto = true;
            }
            if (e.keyCode == 40 && mato_suunta !="ylos" && !suunnan_esto) {
                mato_suunta = "alas";
                suunnan_esto = true;
            }
    
    });
});
//------------------------------------------------------------------------------