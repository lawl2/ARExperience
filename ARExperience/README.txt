0. inserisci un file glb o una risorsa online che punti ad un glb o un glts --> se glts devi avere anche file bin generalmente e jpg (ico) se no non viene visualizzato
1. apri visual studio code con la solution esegui index.html con live server
2. apri cmd nella cartella dove è l'index.html ed esegui grok ngrok http 5500 (la prima volta dovrai inserire la authtoken dal sito di ngrok ngrok config add-authtoken [YOUR_AUTHTOKEN])
3. eseguendo ngrok vedrai l'https e sul browser dovrai incollare quello

Questa variante funziona solo su android nemmeno come visualizzatore Desktop perché non usa web viewer ma una combo di WebXR e Three js