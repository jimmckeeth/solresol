#!/bin/bash
DB="/storage/.kodi/userdata/Database/Addons33.db"
ADDON="script.service.sponsorblock"

echo "Updating database to enable $ADDON..."
sqlite3 "$DB" "UPDATE installed SET enabled = 1 WHERE addonID = '$ADDON';"

echo "Restarting Kodi..."
systemctl restart kodi

echo "Done."
