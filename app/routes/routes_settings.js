var updates = require.main.require('./app/controllers/settings/updates');
var EsResult = require.main.require('./app/models/es_results');
var sets = require.main.require('./app/controllers/sets/get');
var logger = require.main.require('./app/loader/logger');

module.exports = function(app, baseDir) {
    app.get('/settings/appearance', (req, res) => {
        logger.route("GET /settings");
        res.render('partials/settings/appearance');
    })

    app.get('/settings/extensions', (req, res) => {
        logger.route("GET /settings/extensions");
        sets.getSets(sets => {
            res.render('partials/settings/updates', {sets: sets});
        });
    })

    app.post('/settings/sets', (req, res) => {
        logger.route("POST /settings/sets");
        updates.updateSetsList(sets => {
            res.redirect('/settings/updates');
        });
    })

    app.post('/settings/data', (req, res) => {
        logger.route("POST /settings/data");
        numberOfIndexedSets = 0;
        sets.getSets(async sets => {
            totalNumberUpdated = 0;
            totalNumberAdded = 0;
            totalNumberError = 0;
            for (const set of sets) {
                logger.debug("[ " + set.code + " ] Starting set");
                if (!['emn', 'tema', 'tsoi', 'ema', 'tc16', 'w16', 'cn2', 'temn', 'tema', 'psoi', 'tsoi', 'tc16', 'w16', 'rix', 'ddu', 'trix', 'prix', 'plny', 'pnat', 'ta25', 'tdom', 'pdom', '4bb', '4ed', 'fbb', '2ed', 'cc1', 'pm21', 'plgs', 'tcmr', 'pthb', 'pf20', 'thb', 'sld', 'j20', 'gn2', 'mb1', 'teld', 'c19', 'm20', 'ss2', 'mh1', 'pmh1', 'amh1', 'twar', 'prw2', 'prna', 'rna', 'pf19', 'gnt', 'tgrn', 'j18', 'tima', 'tust', 'pust', 'e02', 'pxtc', 'txln', 'pss2', 'htr', 'e01', 'oc17', 'oc15', 'pfrf', 'tcns', 'tddi', 'pwp12', 'l12', 'pm12', 'tnph', 'nph', 'ddg', 'mbs', 'pmps11', 'olgc', 'f12', 'g11', 'p11', 'psom', 'tm11', 'pm11', 'parc', 'arc', 'tdde', 'proe', 'dde', 'pwwk', 'troe', 'pwp10', 'p10', 'pmps10', 'g10', 'h09', 'tddd', 'phop', 'hop', 'tm10', 'ddc', 'tcon', 'con', 'pwp09', 'pdtp', 'pmps09', 'dd2', 'f09', 'pwpn', 'tala', 'teve', 'tshm', 'pmps08', 'tmor', 'f08', 'lrw', 'psum', 'g07', 'p10e', 'pg07', 'plc', 'pgtw', 'p06', 'p2hg', 'pal05', 'g05', 'p05', 'pjse', 'f05', 'wc04', 'p04', 'dst', 'scg', 'lgn', 'g03', 'ons', 'ody', 'pls', '7ed', 'pal02', 'p03', 'pal01', 'mpr', 'inv', 'dkm', 'f01', 'pcy', 'pelp', 's99', 'ulg', 'usg', 'tugl', 'sth', 'ppre', 'tmp', 'ppod', '5ed', 'pvan', 'vis', 'mir', 'all', 'pdrc', 'sum', 'phpr', 'drk', 'atq', 'cei', 'ced', 'cmr', 'piko', 'znc', 'tznr', 'oe01', 'akh', 'cma', 'mp2', 'pakh', 'thou', 'hou', 'dds', 'c17', 'takh', 'paer', 'l17', 'f17', 'c16', 'pss1', 'exp', 'ori', 'mm2', 'tfrf', 'ps15', 'j16', 'tcn2', 'l15', 'pktk', 'ktk', 'tktk', 'v14', 'ddn', 'tm15', 'cp1', 'ppc1', 'cns', 'tdag', 'jou', 'thp3', 'tbth', 'tbng', 'pdp15', 'l14', 'pths', 'ddl', 'psdc', 'tmma', 'ddk', 'pi13', 'rtr', 'opc2', 'tavr', 'ddi', 'pdgm', 'pgtc', 'pidw', 'tddh', 'v11', 'cmd', 'ocmd', 'pmbs', 'tmbs', 'pnph', 'pdp12', 'pwp11', 'tddg', 'ps11', 'tsom', 'twwk', 'wwk', 'f10', 'pzen', 'zen', 'ddd', 'ohop', 'tzen', 'pm10', 'arb', 'g09', 'tdd2', 'ala', 'eve', 'dd1', 'g08', 'tdd1', '10e', 'fut', 't10e', 'pres', 'pmps07', 'pgpx', 'f07', 'p07', 'hho', 'cst', 'csp', 'dis', 'gpt', 'pjas', 'pcmp', 'g06', '9ed', 'rav', 'pmps', 'sok', '5dn', 'f04', 'pjjt', 'ovnt', 'wc02', 'jud', 's00', 'psus', 'wc99', 'ptk', '6ed', 'ath', 'pal99', 'palp', 'jgp', 'exo', 'wc97', 'por', 'wth', 'itp', 'mgb', 'pred', 'pcel', 'rqs', 'lea', 'tznc', 'iko', 'jmp', 'ss3', 'pznr', 'plist', 'und', 'tmh1', 'war', 'pgrn', 'tmed', 'tc18', 'tbbd', 'bbd', '2xm', 'a25', 'apc', 'avr', 'bng', 'brb', 'c18', 'cm2', 'cmb1', 'ddf', 'ddh', 'ddp', 'ddq', 'ddt', 'dom', 'dpa', 'dtk', 'dvd', 'eld', 'evg', 'f02', 'f11', 'f16', 'f18', 'fmb1', 'fnm', 'frf', 'g00', 'g01', 'g02', 'g17', 'g18', 'g99', 'gk1', 'gk2', 'grn', 'gs1', 'h17', 'htr17', 'htr18', 'ice', 'ima', 'j13', 'j17', 'j19', 'kld', 'l16', 'm10', 'm11', 'm12', 'm14', 'm19', 'm21', 'med', 'mmq', 'mps', 'oarc', 'oc14', 'oc16', 'oc18', 'oc19', 'opca', 'p02', 'p09', 'pal00', 'pavr', 'pbbd', 'pbfz', 'pbok', 'pc2', 'pca', 'pcmd', 'pd2', 'pd3', 'pdp10', 'pdtk', 'peld', 'pemn', 'pgru', 'phel', 'pisd', 'pkld', 'plpa', 'pm14', 'pm19', 'pm20', 'pogw', 'pori', 'ppp1', 'pr2', 'prwk', 'ps16', 'ps18', 'ps19', 'pss3', 'ptc', 'ptg', 'ptkdf', 'puma', 'purl', 'pwar', 'pwor', 'pwos', 'pxln', 'roe', 'slu', 'som', 'ss1', 'taer', 'tarb', 'tc15', 'tc17', 'tc19', 'tcm2', 'tddc', 'tddf', 'tddk', 'tddl', 'tddm', 'tdds', 'tddt', 'tddu', 'tgk1', 'tgk2', 'tgn2', 'thp2', 'tisd', 'tjou', 'tkld', 'tm14', 'tm19', 'tm20', 'tmm3', 'togw', 'tor', 'tori', 'tpca', 'trna', 'tthb', 'tuma', 'tund', 'uds', 'ugl', 'uma', 'v09', 'v10', 'v15', 'v16', 'v17', 'wc00', 'wc01', 'wc98', 'xln', 'znr', 'ust', 'te01', 'phou', 'ps17', 'tcma', 'w17', 'mm3', 'ddr'].includes(set.code)) {
                    result = await updates.addOrUpdateSet(set.code, true);
                    totalNumberAdded = totalNumberAdded + result.numberAdded;
                    totalNumberError = totalNumberError + result.numberErrors;
                    totalNumberUpdated = totalNumberUpdated + result.numberUpdated;
                    numberOfIndexedSets += 1;
                    logger.info("[ " + set.code + " ] Fin du set (" + numberOfIndexedSets + "/" + sets.length + ")");
                    logger.info("[ " + set.code + " ] Attente après traitement du set (2s)")
                    await new Promise(r => setTimeout(r, 10000));
                    logger.info("[ " + set.code + " ] Fin de l'attente")
                }
            }
            res.status(200).send({
                message: "Synchronisation des données des éditions.<ul><li>"
                            + totalNumberAdded + " cartes ajoutées ;</li><li> "
                            + totalNumberUpdated + " cartes mises à jour ;</li><li> "
                            + totalNumberError + " cartes en erreur ;</li></ul>"
                            + "Aucune image n'a été mise à jour"
            });
        });
    })

    app.post('/settings/images', (req, res) => {
        logger.route("POST /settings/images");
        sets.getSets(async sets => {
            for (const set of sets) {
                logger.debug("[ " + set.code + " ] Début de la récupération des images");
                result = await updates.getSetImages(set.code, false);
                logger.debug("[ " + set.code + " ] Fin de la récupération des images");
                await new Promise(r => setTimeout(r, 10000));
                logger.debug("Fin du timeout");
            }
            res.status(200).send({
                message: "Synchronisation des images réalisée avec succès."
            });
        });
    })

    app.post('/settings/prices', (req, res) => {
        logger.route("POST /settings/prices");
        res.redirect('/settings/updates');
    })

    app.post('/settings/sets/addOrUpdate', async (req, res) => {
        logger.route("POST /settings/sets/addOrUpdate");
        if (req.body.setCode) {
            result = await updates.addOrUpdateSet(req.body.setCode, true);
            res.status(200).send({
                message: "Synchronisation de " + req.body.setName + ".<ul><li>"
                            + result.numberAdded + " cartes ajoutées ;</li><li> "
                            + result.numberUpdated + " cartes mises à jour ;</li><li> "
                            + result.numberErrors + " cartes en erreur ;</li></ul> ",
                setCode: req.body.setCode
            });
        } else {
            logger.warn("Demande de Synchronisation sans fournir d'édition.");
            res.status(400).send("Demande de synchronisation sans fournir d'édition.");
        }
    })

    app.post('/settings/sets/delete', (req, res) => {
        logger.route("POST /settings/sets/delete");
        if (req.body.setCode) {
            logger.info("Suppression de l'édition " + req.body.setCode);
            res.status(200).send({ 
                message: "Suppression de " + req.body.setName + " réalisée avec succès.",
                setCode: req.body.setCode
            });
        } else {
            logger.warn("Demande de suppression sans fournir d'édition.");
            res.status(400).send("Demande de suppression sans fournir d'édition.");
        }
    })

    app.post('/settings/symbols', (req, res) => {
        logger.route("POST /settings/symbols");
        updates.getSymbols(() => {
            res.status(200).send({
                message: "Symboles récupérés avec succès."
            }); 
        })
    })
}