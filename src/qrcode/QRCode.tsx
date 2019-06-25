import React from 'react';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { Link} from 'react-router-dom';
import QRCode from 'qrcode.react';
 
const QRCodeDialog = ({url}:{url:string}) => {
    const urldefault = `https://${window.location.host}${url}`;
    return (
            <Dialog fullScreen typeof="" aria-labelledby="form-dialog-title" open>
                <>
                    <DialogTitle id="simple-dialog-title">
                        {urldefault}
                    </DialogTitle>
                    <DialogContent style={{display: "flex", justifyContent: "center"}}>
                        <QRCode size={300} value={urldefault} />
                    </DialogContent>
                    <DialogActions>
                        <Link className="MuiButtonBase-root MuiButton-root MuiButton-text" to={url}>
                            Close
                        </Link>
                    </DialogActions>
                </>
            </Dialog>        
    );
}

export default QRCodeDialog;