import sys
import numpy as np
import cv2
import wave
import os
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QTabWidget, QLabel, QLineEdit, QPushButton, QFileDialog, QMessageBox, 
    QGroupBox, QSpinBox, QTextEdit
)

# --- Core Logic Functions ---

# Text Steganography
def txt_encode(text, cover_file, stego_file):
    l=len(text)
    i=0
    add=''
    while i<l:
        t=ord(text[i])
        if(t>=32 and t<=64):
            t1=t+48
            t2=t1^170
            res = bin(t2)[2:].zfill(8)
            add+="0011"+res
        else:
            t1=t-48
            t2=t1^170
            res = bin(t2)[2:].zfill(8)
            add+="0110"+res
        i+=1
    res1=add+"111111111111"
    
    ZWC={"00":u'\u200C',"01":u'\u202C',"11":u'\u202D',"10":u'\u200E'}      
    try:
        with open(cover_file,"r", encoding="utf-8") as file1:
            word=[]
            for line in file1: 
                word+=line.split()
    except Exception as e:
        # Fallback reading
        with open(cover_file,"r") as file1:
            word=[]
            for line in file1: 
                word+=line.split()
                
    with open(stego_file,"w+", encoding="utf-8") as file3:
        i=0
        while(i<len(res1)):  
            s=word[int(i/12)]
            j=0
            x=""
            HM_SK=""
            while(j<12):
                x=res1[j+i]+res1[i+j+1]
                HM_SK+=ZWC[x]
                j+=2
            s1=s+HM_SK
            file3.write(s1)
            file3.write(" ")
            i+=12
        t=int(len(res1)/12)     
        while t<len(word): 
            file3.write(word[t])
            file3.write(" ")
            t+=1
    return "Stego text file successfully generated."

def BinaryToDecimal(binary):
    string = int(binary, 2)
    return string

def decode_txt_data(stego_file):
    ZWC_reverse={u'\u200C':"00",u'\u202C':"01",u'\u202D':"11",u'\u200E':"10"}
    file4= open(stego_file,"r", encoding="utf-8")
    temp=''
    for line in file4: 
        for words in line.split():
            T1=words
            binary_extract=""
            for letter in T1:
                if(letter in ZWC_reverse):
                     binary_extract+=ZWC_reverse[letter]
            if binary_extract=="111111111111":
                break
            else:
                temp+=binary_extract
    
    i=0
    a=0
    b=4
    c=4
    d=12
    final=''
    while i<len(temp):
        t3=temp[a:b]
        a+=12
        b+=12
        i+=12
        t4=temp[c:d]
        c+=12
        d+=12
        if t3 == '' or t4 == '':
            break
        if(t3=='0110'):
            decimal_data = BinaryToDecimal(t4)
            final+=chr((decimal_data ^ 170) + 48)
        elif(t3=='0011'):
            decimal_data = BinaryToDecimal(t4)
            final+=chr((decimal_data ^ 170) - 48)
    file4.close()
    return final

# Image Steganography
def msgtobinary(msg):
    if type(msg) == str:
        result= ''.join([ format(ord(i), "08b") for i in msg ])
    elif type(msg) == bytes or type(msg) == np.ndarray:
        result= [ format(i, "08b") for i in msg ]
    elif type(msg) == int or type(msg) == np.uint8:
        result=format(msg, "08b")
    else:
        raise TypeError("Input type is not supported in this function")
    return result

def encode_img_data(img_path, data, stego_path):
    img = cv2.imread(img_path)
    if img is None:
        raise ValueError("Image not found")
        
    no_of_bytes=(img.shape[0] * img.shape[1] * 3) // 8
    if(len(data)>no_of_bytes):
        raise ValueError("Insufficient bytes Error, Need Bigger Image or give Less Data !!")
    
    data +='*^*^*'    
    binary_data=msgtobinary(data)
    length_data=len(binary_data)
    
    index_data = 0
    for i in img:
        for pixel in i:
            r, g, b = msgtobinary(pixel)
            if index_data < length_data:
                pixel[0] = int(r[:-1] + binary_data[index_data], 2) 
                index_data += 1
            if index_data < length_data:
                pixel[1] = int(g[:-1] + binary_data[index_data], 2) 
                index_data += 1
            if index_data < length_data:
                pixel[2] = int(b[:-1] + binary_data[index_data], 2) 
                index_data += 1
            if index_data >= length_data:
                break
    cv2.imwrite(stego_path,img)
    return "Encoded the data successfully in the Image."

def decode_img_data(img_path):
    img = cv2.imread(img_path)
    if img is None:
        raise ValueError("Image not found")
        
    data_binary = ""
    for i in img:
        for pixel in i:
            r, g, b = msgtobinary(pixel) 
            data_binary += r[-1]  
            data_binary += g[-1]  
            data_binary += b[-1]  
            total_bytes = [ data_binary[i: i+8] for i in range(0, len(data_binary), 8) ]
            decoded_data = ""
            for byte in total_bytes:
                decoded_data += chr(int(byte, 2))
                if decoded_data[-5:] == "*^*^*": 
                    return decoded_data[:-5]
    return "No hidden data found."

# Audio Steganography
def encode_aud_data(audio_file, data, stego_file):
    song = wave.open(audio_file, mode='rb')
    nframes=song.getnframes()
    frames=song.readframes(nframes)
    frame_list=list(frames)
    frame_bytes=bytearray(frame_list)

    data = data + '*^*^*'
    result = []
    for c in data:
        bits = bin(ord(c))[2:].zfill(8)
        result.extend([int(b) for b in bits])

    j = 0
    for i in range(0,len(result),1): 
        res = bin(frame_bytes[j])[2:].zfill(8)
        if res[len(res)-4]== str(result[i]): 
            frame_bytes[j] = (frame_bytes[j] & 253)      #253: 11111101
        else:
            frame_bytes[j] = (frame_bytes[j] & 253) | 2
            frame_bytes[j] = (frame_bytes[j] & 254) | result[i]
        j = j + 1
    
    frame_modified = bytes(frame_bytes)

    with wave.open(stego_file, 'wb') as fd:
        fd.setparams(song.getparams())
        fd.writeframes(frame_modified)
    song.close()
    return "Encoded the data successfully in the audio file."

def decode_aud_data(stego_file):
    song = wave.open(stego_file, mode='rb')
    nframes=song.getnframes()
    frames=song.readframes(nframes)
    frame_list=list(frames)
    frame_bytes=bytearray(frame_list)

    extracted = ""
    p=0
    for i in range(len(frame_bytes)):
        if(p==1):
            break
        res = bin(frame_bytes[i])[2:].zfill(8)
        if res[len(res)-2]=='0':
            extracted+=res[len(res)-4]
        else:
            extracted+=res[len(res)-1]
    
        all_bytes = [ extracted[i: i+8] for i in range(0, len(extracted), 8) ]
        decoded_data = ""
        for byte in all_bytes:
            decoded_data += chr(int(byte, 2))
            if decoded_data[-5:] == "*^*^*":
                song.close()
                return decoded_data[:-5]
    song.close()
    return "No hidden data found."

# Video Steganography
def KSA(key):
    key_length = len(key)
    S=list(range(256)) 
    j=0
    for i in range(256):
        j=(j+S[i]+key[i % key_length]) % 256
        S[i],S[j]=S[j],S[i]
    return S

def PRGA(S,n):
    i=0
    j=0
    key=[]
    while n>0:
        n=n-1
        i=(i+1)%256
        j=(j+S[i])%256
        S[i],S[j]=S[j],S[i]
        K=S[(S[i]+S[j])%256]
        key.append(K)
    return key

def preparing_key_array(s):
    return [ord(c) for c in s]

def encryption(plaintext, key_str):
    key=preparing_key_array(key_str)
    S=KSA(key)
    keystream=np.array(PRGA(S,len(plaintext)))
    plaintext=np.array([ord(i) for i in plaintext])
    cipher=keystream^plaintext
    ctext=''
    for c in cipher:
        ctext=ctext+chr(c)
    return ctext

def decryption(ciphertext, key_str):
    key=preparing_key_array(key_str)
    S=KSA(key)
    keystream=np.array(PRGA(S,len(ciphertext)))
    ciphertext=np.array([ord(i) for i in ciphertext])
    decoded=keystream^ciphertext
    dtext=''
    for c in decoded:
        dtext=dtext+chr(c)
    return dtext

def embed(frame, data, key_str):
    data=encryption(data, key_str)
    if (len(data) == 0): 
        raise ValueError('Data entered to be encoded is empty')
    data +='*^*^*'
    binary_data=msgtobinary(data)
    length_data = len(binary_data)
    index_data = 0
    for i in frame:
        for pixel in i:
            r, g, b = msgtobinary(pixel)
            if index_data < length_data:
                pixel[0] = int(r[:-1] + binary_data[index_data], 2) 
                index_data += 1
            if index_data < length_data:
                pixel[1] = int(g[:-1] + binary_data[index_data], 2) 
                index_data += 1
            if index_data < length_data:
                pixel[2] = int(b[:-1] + binary_data[index_data], 2) 
                index_data += 1
            if index_data >= length_data:
                break
        return frame

def extract(frame, key_str):
    data_binary = ""
    final_decoded_msg = ""
    for i in frame:
        for pixel in i:
            r, g, b = msgtobinary(pixel) 
            data_binary += r[-1]  
            data_binary += g[-1]  
            data_binary += b[-1]  
            total_bytes = [ data_binary[i: i+8] for i in range(0, len(data_binary), 8) ]
            decoded_data = ""
            for byte in total_bytes:
                decoded_data += chr(int(byte, 2))
                if decoded_data[-5:] == "*^*^*": 
                    for i in range(0,len(decoded_data)-5):
                        final_decoded_msg += decoded_data[i]
                    final_decoded_msg = decryption(final_decoded_msg, key_str)
                    return final_decoded_msg
    return None

def encode_vid_data(cover_vid, data, stego_vid, frame_num, key_str):
    vidcap = cv2.VideoCapture(cover_vid)    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    frame_width = int(vidcap.get(3))
    frame_height = int(vidcap.get(4))

    size = (frame_width, frame_height)
    out = cv2.VideoWriter(stego_vid, fourcc, 25.0, size)
    
    frame_number = 0
    encoded = False
    while(vidcap.isOpened()):
        frame_number += 1
        ret, frame = vidcap.read()
        if ret == False:
            break
        if frame_number == frame_num and not encoded:    
            change_frame_with = embed(frame, data, key_str)
            if change_frame_with is not None:
                frame = change_frame_with
            encoded = True
        out.write(frame)
    
    vidcap.release()
    out.release()
    return "Encoded the data successfully in the video file."

def decode_vid_data(stego_vid, frame_num, key_str):
    vidcap = cv2.VideoCapture(stego_vid)
    frame_number = 0
    while(vidcap.isOpened()):
        frame_number += 1
        ret, frame = vidcap.read()
        if ret == False:
            break
        if frame_number == frame_num:
            res = extract(frame, key_str)
            vidcap.release()
            return res if res else "No hidden data found in frame."
    vidcap.release()
    return "Frame not found."

# --- GUI Interface ---

class StegoTab(QWidget):
    def __init__(self, tab_type):
        super().__init__()
        self.tab_type = tab_type
        self.init_ui()

    def init_ui(self):
        main_layout = QVBoxLayout()

        # Encode Section
        encode_group = QGroupBox(f"Encode {self.tab_type}")
        enc_layout = QVBoxLayout()
        
        self.enc_cover_btn = QPushButton(f"Select Cover {self.tab_type}")
        self.enc_cover_lbl = QLabel("No file selected")
        enc_layout.addWidget(self.enc_cover_btn)
        enc_layout.addWidget(self.enc_cover_lbl)
        self.enc_cover_btn.clicked.connect(self.select_cover_file)

        self.enc_msg_input = QTextEdit()
        self.enc_msg_input.setPlaceholderText("Enter secret message here...")
        enc_layout.addWidget(self.enc_msg_input)
        
        if self.tab_type == "Video":
            self.enc_frame_spinner = QSpinBox()
            self.enc_frame_spinner.setPrefix("Frame No: ")
            self.enc_frame_spinner.setMinimum(1)
            self.enc_frame_spinner.setMaximum(999999)
            enc_layout.addWidget(self.enc_frame_spinner)

            self.enc_key_input = QLineEdit()
            self.enc_key_input.setPlaceholderText("Enter Secret Key")
            enc_layout.addWidget(self.enc_key_input)

        self.enc_save_btn = QPushButton("Encode and Save As")
        self.enc_save_btn.clicked.connect(self.encode_data)
        enc_layout.addWidget(self.enc_save_btn)

        encode_group.setLayout(enc_layout)
        main_layout.addWidget(encode_group)

        # Decode Section
        decode_group = QGroupBox(f"Decode {self.tab_type}")
        dec_layout = QVBoxLayout()

        self.dec_stego_btn = QPushButton(f"Select Stego {self.tab_type}")
        self.dec_stego_lbl = QLabel("No file selected")
        dec_layout.addWidget(self.dec_stego_btn)
        dec_layout.addWidget(self.dec_stego_lbl)
        self.dec_stego_btn.clicked.connect(self.select_stego_file)
        
        if self.tab_type == "Video":
            self.dec_frame_spinner = QSpinBox()
            self.dec_frame_spinner.setPrefix("Frame No: ")
            self.dec_frame_spinner.setMinimum(1)
            self.dec_frame_spinner.setMaximum(999999)
            dec_layout.addWidget(self.dec_frame_spinner)

            self.dec_key_input = QLineEdit()
            self.dec_key_input.setPlaceholderText("Enter Secret Key")
            dec_layout.addWidget(self.dec_key_input)

        self.dec_action_btn = QPushButton("Decode")
        self.dec_action_btn.clicked.connect(self.decode_data)
        dec_layout.addWidget(self.dec_action_btn)

        self.dec_result = QTextEdit()
        self.dec_result.setReadOnly(True)
        dec_layout.addWidget(self.dec_result)

        decode_group.setLayout(dec_layout)
        main_layout.addWidget(decode_group)

        self.setLayout(main_layout)

    def select_cover_file(self):
        dialog = QFileDialog()
        file, _ = dialog.getOpenFileName()
        if file:
            self.enc_cover_lbl.setText(file)

    def select_stego_file(self):
        dialog = QFileDialog()
        file, _ = dialog.getOpenFileName()
        if file:
            self.dec_stego_lbl.setText(file)

    def encode_data(self):
        cover = self.enc_cover_lbl.text()
        msg = self.enc_msg_input.toPlainText()
        if cover == "No file selected" or not msg.strip():
            QMessageBox.warning(self, "Error", "Select a cover file and enter a message.")
            return

        dialog = QFileDialog()
        output_file, _ = dialog.getSaveFileName(self, "Save Stego File")
        if not output_file:
            return

        try:
            if self.tab_type == "Text":
                res = txt_encode(msg, cover, output_file)
            elif self.tab_type == "Image":
                res = encode_img_data(cover, msg, output_file)
            elif self.tab_type == "Audio":
                res = encode_aud_data(cover, msg, output_file)
            elif self.tab_type == "Video":
                key = self.enc_key_input.text()
                if not key:
                    QMessageBox.warning(self, "Error", "Key is required for Video.")
                    return
                frame_no = self.enc_frame_spinner.value()
                res = encode_vid_data(cover, msg, output_file, frame_no, key)
            QMessageBox.information(self, "Success", str(res))
        except Exception as e:
            QMessageBox.critical(self, "Error", str(e))

    def decode_data(self):
        stego_file = self.dec_stego_lbl.text()
        if stego_file == "No file selected":
            QMessageBox.warning(self, "Error", "Select a stego file to decode.")
            return

        try:
            res = ""
            if self.tab_type == "Text":
                res = decode_txt_data(stego_file)
            elif self.tab_type == "Image":
                res = decode_img_data(stego_file)
            elif self.tab_type == "Audio":
                res = decode_aud_data(stego_file)
            elif self.tab_type == "Video":
                key = self.dec_key_input.text()
                if not key:
                    QMessageBox.warning(self, "Error", "Key is required for Video.")
                    return
                frame_no = self.dec_frame_spinner.value()
                res = decode_vid_data(stego_file, frame_no, key)
            
            self.dec_result.setText(str(res))
        except Exception as e:
            QMessageBox.critical(self, "Error", str(e))


class SteganographyApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Steganography Tool Suite - PyQt5")
        self.setGeometry(200, 200, 600, 700)
        self.init_ui()

    def init_ui(self):
        self.tabs = QTabWidget()
        
        self.tab_image = StegoTab("Image")
        self.tabs.addTab(self.tab_image, "Image Steganography")
        
        self.tab_text = StegoTab("Text")
        self.tabs.addTab(self.tab_text, "Text Steganography")

        self.tab_audio = StegoTab("Audio")
        self.tabs.addTab(self.tab_audio, "Audio Steganography")

        self.tab_video = StegoTab("Video")
        self.tabs.addTab(self.tab_video, "Video Steganography")

        self.setCentralWidget(self.tabs)

if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = SteganographyApp()
    window.show()
    sys.exit(app.exec_())
