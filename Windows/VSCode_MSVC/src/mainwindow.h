/*
 * @Coding: utf-8
 * @Author: vector-wlc
 * @Date: 2020-09-18 09:39:24
 * @Description: 
 */
#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <qlabel.h>
#pragma comment(lib, "user32.lib")
#pragma execution_character_set("utf-8")

class MainWindow : public QMainWindow {
    Q_OBJECT

public:
    MainWindow(QWidget* parent = nullptr);
    ~MainWindow();
};
#endif // MAINWINDOW_H
