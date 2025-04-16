# Guide Détaillé des Commandes

## 🛡️ Commandes de Modération

### ℹ️ Ban
**Description**
> Bannit un utilisateur du serveur de façon permanente
**Usage**
> `+ban <@utilisateur/ID> [raison]`
**Options**
> `--silent` : Bannit sans envoyer de message dans le salon
> `--del [jours]` : Supprime les messages (1-7 jours)
**Permissions**
> BanMembers
**Exemples**
> `+ban @user Spam`
> `+ban @user Publicité --del 2 --silent`

### ℹ️ Kick
**Description**
> Expulse un utilisateur du serveur
**Usage**
> `+kick <@utilisateur/ID> [raison]`
**Permissions**
> KickMembers
**Exemples**
> `+kick @user Comportement toxique`

### ℹ️ Mute
**Description**
> Réduit au silence un utilisateur avec système progressif
**Usage**
> `+mute <@utilisateur/ID> [durée] [raison]`
**Options**
> `--notify` : Envoie une notification en DM
> `--silent` : Mute silencieusement
**Permissions**
> ModerateMembers
**Exemples**
> `+mute @user 1h Spam --notify`
> `+mute @user 30m Comportement toxique --silent`

### ℹ️ TempMute
**Description**
> Mute temporairement un utilisateur
**Usage**
> `+tempmute <@utilisateur/ID> [durée] [raison]`
**Permissions**
> ModerateMembers
**Exemples**
> `+tempmute @user 30m Spam excessif`

### ℹ️ Unmute
**Description**
> Retire le mute d'un utilisateur
**Usage**
> `+unmute <@utilisateur/ID>`
**Permissions**
> ModerateMembers
**Exemples**
> `+unmute @user`

### ℹ️ Warn
**Description**
> Donne un avertissement avec système progressif
**Usage**
> `+warn <@utilisateur/ID> [raison]`
**Permissions**
> ModerateMembers
**Exemples**
> `+warn @user Langage inapproprié`

### ℹ️ Clear
**Description**
> Supprime des messages en masse
**Usage**
> `+clear <nombre> [options]`
**Options**
> `--bots` : Messages des bots uniquement
> `--users` : Messages des utilisateurs uniquement
> `--from @user` : Messages d'un utilisateur spécifique
**Permissions**
> ManageMessages
**Exemples**
> `+clear 50`
> `+clear 20 --from @user`

### ℹ️ Lock
**Description**
> Verrouille un salon pour empêcher les messages
**Usage**
> `+lock [message]`
**Permissions**
> ManageChannels
**Exemples**
> `+lock Maintenance en cours`
> `+lock RAID en cours - Canal verrouillé`

### ℹ️ Unlock
**Description**
> Déverrouille un salon
**Usage**
> `+unlock`
**Permissions**
> ManageChannels
**Exemples**
> `+unlock`

## ⚙️ Configuration

### ℹ️ ServerInfo
**Description**
> Affiche les informations détaillées du serveur
**Usage**
> `+serverinfo`
**Permissions**
> ManageGuild
**Exemples**
> `+serverinfo`

### ℹ️ UserInfo
**Description**
> Affiche les informations d'un utilisateur
**Usage**
> `+userinfo [@utilisateur]`
**Permissions**
> ManageGuild
**Exemples**
> `+userinfo @user`

### ℹ️ Anti-Raid
**Description**
> Configure la protection anti-raid
**Usage**
> `+anti-raid <on/off/settings>`
**Permissions**
> ManageGuild
**Exemples**
> `+anti-raid on`

### ℹ️ Raid-Mode
**Description**
> Active/désactive le mode anti-raid avec paramètres avancés
**Usage**
> `+raid-mode <on/off> [--strict] [--lockdown]`
**Options**
> `--strict` : Mode strict avec vérification renforcée
> `--lockdown` : Verrouille les canaux en cas de raid
**Permissions**
> ManageGuild
**Exemples**
> `+raid-mode on --strict`

## 📊 Utilitaires

### ℹ️ Help
**Description**
> Affiche la liste des commandes par catégorie
**Usage**
> `+help [commande]`
**Permissions**
> Aucune
**Exemples**
> `+help ban`

### ℹ️ Info
**Description**
> Affiche les informations sur une commande
**Usage**
> `+info [commande]`
**Permissions**
> Aucune
**Exemples**
> `+info warn`

### ℹ️ Ping
**Description**
> Affiche la latence du bot
**Usage**
> `+ping`
**Permissions**
> Aucune
**Exemples**
> `+ping`

### ℹ️ Snipe
**Description**
> Affiche le dernier message supprimé
**Usage**
> `+snipe`
**Permissions**
> Aucune
**Exemples**
> `+snipe`

## 🔒 Commandes Owner

### ℹ️ Maintenance
**Description**
> Active/désactive le mode maintenance du bot
**Usage**
> `+maintenance <on/off> [raison]`
**Permissions**
> OwnerOnly
**Exemples**
> `+maintenance on Mise à jour`

### ℹ️ Debug 
**Description**
> Affiche les informations de débogage du bot
**Usage**
> `+debug`
**Permissions**
> OwnerOnly
**Exemples**
> `+debug`

### ℹ️ Eval
**Description**
> Exécute du code JavaScript en temps réel
**Usage**
> `+eval <code>`
**Permissions**
> OwnerOnly
**Exemples**
> `+eval message.guild.memberCount`

### ℹ️ Restart
**Description**
> Redémarre le bot
**Usage**
> `+restart`
**Permissions**
> OwnerOnly
**Exemples**
> `+restart`

### ℹ️ OwnerOnly
**Description**
> Gère les utilisateurs autorisés
**Usage**
> `+owneronly <add/remove/list> [@utilisateur]`
**Permissions**
> OwnerOnly
**Exemples**
> `+owneronly add @user`

## Notes
**Durées disponibles**
> `s` : Secondes
> `m` : Minutes
> `h` : Heures
> `d` : Jours
**Exemples de durées**
> `30m` : 30 minutes
> `1h30m` : 1 heure et 30 minutes
> `7d` : 7 jours
**Permissions**
> Les commandes Owner sont réservées au propriétaire
> Certaines commandes nécessitent des permissions spécifiques
